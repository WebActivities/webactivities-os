var BusNotifyType = {
	ADD : 0,
	REMOVE : 2
};

var Bus = function() {

	this.data = {};
	this.componentBuses = [];

	this.topicMatch = function(topic, topicSpec) {
		var regexp = topicSpec.replace(new RegExp("\\.", "g"), "\\.");

		regexp = regexp.replace(new RegExp("\\*\\*", "g"), "??");
		regexp = regexp.replace(new RegExp("\\*", "g"), "[^\.]+");
		regexp = regexp.replace(new RegExp("\\?\\?", "g"), "([^\.]+\.?)+");

		var res = topic.match(new RegExp("^" + regexp + "$"));

		return res != null && res[0] == topic;
	};

	this.createBus = function(publisherId) {
		var ab = new ComponentBus(this,publisherId);
		this.componentBuses.push(ab);
		return ab;
	};

	this.removeBus = function(componentBus) {
		var i = 0;
		for (i = 0; i < this.componentBuses.length; i++) {
			var value = this.componentBuses[i];
			if (value === componentBus) {
				this.componentBuses.splice(i, 1);
				i--;
			}
		}
	};

	var self = this;
	var notifyAll = function(notifyType, topic, pubData) {
		var i = 0;
		for (i = 0; i < self.componentBuses.length; i++) {
			self.componentBuses[i]._notifyData(notifyType, topic, pubData);
		}
	};
	
	this.publishData = function(topic, object, componentBus) {
		if (!this.data[topic]) {
			this.data[topic] = [];
		}
		var pubData = {
			payload : object,
			componentBus : componentBus
		};
		this.data[topic].push(pubData);
		notifyAll(BusNotifyType.ADD,topic,pubData);
	};

	this.unpublishData = function(topic, object, componentBus) {
		var arr = this.data[topic];
		var i = 0;
		for (i = 0; i < arr.length; i++) {
			var value = arr[i];
			if (value.payload === object && value.componentBus === componentBus) {
				var removed = arr.splice(i, 1);
				i--;
				notifyAll(BusNotifyType.REMOVE,topic,removed[0]);
			}
		}
	};

	/**
	 * Ritorna i dati contenuti nei topics specificati.
	 * se viene specificato includePubsInfo i dati ritornati per ogni topics includono le informazioni
	 * su chi ha pubblicato il dato.
	 *
	 */
	this.readData = function(topicSpec,includePubsInfo) {
		var ret = {};
		for ( var topic in this.data) {
			if (this.topicMatch(topic, topicSpec)) {
				var arr = this.data[topic];
				var pubs = [];
				for ( var i in arr) {
					var p = null, item = arr[i];
					if (includePubsInfo) {
						p = {
							obj: item.payload,
							publisherId: item.componentBus.publisherId
						};
					} else {
						p = item.payload;
					};
					pubs.push(p);
				}
				ret[topic] = pubs;
			}
		}
		return ret;
	};

	this.destroyData = function(componentBus) {
		for ( var topic in this.data) {
			var arr = this.data[topic];
			var i = 0;
			for (i = 0; i < arr.length; i++) {
				var value = arr[i];
				if (value.componentBus === componentBus) {
					arr.splice(i, 1);
					i--;
					notifyAll(BusNotifyType.REMOVE,topic,value);
				}
			}
		}
	};

};

var ComponentBus = function(bus,publisherId) {

	this.subscriptions = new Array();

	this.bus = bus;
	
	/**
	 * L'id del publisher che usa questo ComponentBus.
	 * 
	 * @property publisherId
	 * @readOnly
	 * @type String
	 */
	this.publisherId =publisherId;

	this.publish = function(topic, object) {
		bus.publishData(topic, object, this);
	};

	this.unpublish = function(topic, object) {
		bus.unpublishData(topic, object, this);
	};

	this.subscribe = function(topicSpec, onDataChanged, includePubsInfo) {
		var subscription = new Subscription(this, topicSpec, onDataChanged, includePubsInfo);
		this.subscriptions.push(subscription);
		subscription._initialNotify();
		return subscription;
	};
	
	this.subscribeTopic = function(topic, onDataChanged, includePubsInfo) {
		return this.subscribe(topic,function(added,removed) {
			onDataChanged(added[topic]||[],removed[topic]||[]);
		}, includePubsInfo);
	};

	this.unsubscribe = function(subscription) {
		for (var i = 0; i < this.subscriptions.length; i++) {
			if (this.subscriptions[i] == subscription) {
				this.subscriptions.splice(i, 1);
				i--;
			}
		}
	};

	this.unsubscribeAll = function() {
		for ( var i in this.subscriptions) {
			this.unsubscribe(this.subscriptions[i]);
		}
	};

	this._notifyData = function(action, topic, pubData) {
		for (var i = 0; i < this.subscriptions.length; i++) {

			var s = this.subscriptions[i];
			var collector = s.createOrGetNotifyCollector();

			if (this.bus.topicMatch(topic, s.topicSpec)) {

				if (action == BusNotifyType.ADD) {
					collector.addChange(topic, pubData);
				} else if (action == BusNotifyType.REMOVE) {
					collector.addRemove(topic, pubData);
				}
			}
		}

	};

	this.destroy = function() {
		this.unsubscribeAll();
		bus.removeBus(this);
		bus.destroyData(this);
	};

	this.readTopic = function(topic) {
		return bus.readData(topic)[topic];
	};

	this.readAllTopics = function(topicSpec) {
		return bus.readData(topicSpec);
	};
	
	/**
	 * Sincronizza l'array passato sul topic specificato.
	 * Chiama l'onChange quando ci sono modifiche.
	 *
	 * @method syncTopic
	 */
	this.syncTopic = function(topic,arrayTosync,onChange,includePubsInfo) {
		return this.subscribeTopic(topic, function(added,removed) {
			$.each(added,function(i,a) {
				arrayTosync.push(a);
			});
			$.each(removed,function(i,a) {
				var i;
				for (i=arrayTosync.length-1; i>=0; i--) {
					var item = arrayTosync[i];
					if (includePubsInfo && item.obj==a.obj || 
						!includePubsInfo && item==a) {
						arrayTosync.splice(i,1);
					}
				}
			});
			onChange();
		},includePubsInfo);
	};

};

var Subscription = function(componentBus, topicSpec, onDataChanged, includePubsInfo) {

	this.topicSpec = topicSpec;
	this.onDataChanged = onDataChanged;
	this.notifyCollector = null;
	this.includePubsInfo = includePubsInfo;

	this.remove = function() {
		componentBus.unsubscribe(this);
	};

	this.readTopics = function(includePubsInfo) {
		return componentBus.bus.readData(this.topicSpec,includePubsInfo||this.includePubsInfo);
	};

	this.createOrGetNotifyCollector = function() {
		if (this.notifyCollector == null) {
			this.notifyCollector = new NotifyCollector(this);
		}
		return this.notifyCollector;
	};

	this.destroyNotifyCollector = function() {
		this.notifyCollector = null;
	};
	
	this._initialNotify = function() {
		var initialData = this.readTopics();
		var collector = this.createOrGetNotifyCollector();
		$.each(initialData,function(k,arr){
			$.each(arr,function(i,o) {				
				collector._addChange(k,o);
			});
		});
	};

};

var NotifyCollector = function(subscription) {

	var self = this;
	this.includePubsInfo = subscription.includePubsInfo;
	this.pendingChanges = {};
	this.pendingRemoval = {};

	setTimeout(function($this, subscription) {
		return function() {
			if (typeof (subscription.onDataChanged) == "function") {
				if (Object.getOwnPropertyNames($this.pendingChanges).length !== 0 || Object.getOwnPropertyNames($this.pendingRemoval).length !== 0) {
					subscription.onDataChanged($this.pendingChanges, $this.pendingRemoval);
				}
			}
			subscription.destroyNotifyCollector();
		};
	}(this, subscription), 0);

	var getChangeObject = function(pubData) {
		if (self.includePubsInfo) {
			return {
				obj: pubData.payload,
				publisherId: pubData.componentBus.publisherId
			};
		} else {
			return pubData.payload;
		}
	};
	
	this.addChange = function(topic, pubData) {
		var object =getChangeObject(pubData);
		this._addChange(topic, object);

	};
	
	this._addChange = function(topic, object) {
		if (!this.pendingChanges[topic]) {
			this.pendingChanges[topic] = [];
		}
		this.removeIfFind(this.pendingRemoval[topic], object);
		this.pendingChanges[topic].push(object);

	};

	this.addRemove = function(topic, pubData) {
		if (!this.pendingRemoval[topic]) {
			this.pendingRemoval[topic] = [];
		}
		var object =getChangeObject(pubData);
		this.removeIfFind(this.pendingChanges[topic], object);
		this.pendingRemoval[topic].push(object);
	};
	
	this.removeIfFind = function(changesList, changeObj) {
		if (changesList) {
			var i = 0;
			for (i = 0; i < changesList.length; i++) {
				var changesListItem = changesList[i];
				if ((this.includePubsInfo && changesListItem.obj == changeObj.obj) ||
				   (!(this.includePubsInfo) && changesListItem == changeObj)) {
					changesList.splice(i, 1);
					i--;
				}
			}
		}
	};

};

function testBus() {

	var b = new Bus();

	console.log(b.topicMatch("it", "*") === true);
	console.log(b.topicMatch("it.eng.pippo", "*") === false);
	console.log(b.topicMatch("it.eng.pippo", "**") === true);
	console.log(b.topicMatch("it.eng.pippo", "it.eng.pippo") === true);
	console.log(b.topicMatch("it.eng.pippo", "it.*.pippo") === true);
	console.log(b.topicMatch("it.eng.pippo.pluto", "it.eng.*") === false);
	console.log(b.topicMatch("it.eng.pippo.pluto", "it.**.pluto") === true);
	console.log(b.topicMatch("it.eng.pippo.pluto", "it.*.pluto") === false);
	console.log(b.topicMatch("it.eng.pippo.pluto", "it.eng.**") === true);
	console.log(b.topicMatch("it.eng.pippo", "**.pippo") === true);
	console.log(b.topicMatch("it.eng.mare.pippo.pluto.casa", "it.**.pippo.**.casa") === true);
	console.log(b.topicMatch("it.eng.mare.pippo.pluto.casa", "it.**.pippo.**") === true);
	console.log(b.topicMatch("it.eng.mare.pippo.pluto.casa", "it.**.pippo.*.casa") === true);
	console.log(b.topicMatch("it.eng.mare.pippo.pluto.casa", "it.**.pippo.*.computer") === false);

	var ab1 = b.createBus();
	var sub1 = ab1.subscribe("it.eng.*", function(added, removed) {
		console.log("1)");
		console.log("Added");
		console.log(added);
		console.log("Removed");
		console.log(removed);
	});

	var ab2 = b.createBus();
	ab2.publish("it.eng.pippo", "Ciao!");
	ab2.unpublish("it.eng.pippo", "Ciao!");
	ab2.publish("it.eng.pippo", "Ciao!");
	ab2.publish("it.eng.pippo.pluto", "Hello!");

	var ab3 = b.createBus();
	ab3.publish("it.eng.pippo", "Bonjour!");
	ab3.unpublish("it.eng.pippo", "Bonjour!");
	// ab2.destroy();

	// console.log(sub1.readTopics());

}
// testBus();