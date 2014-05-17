var BusNotifyType = {
	ADD : 0,
	REMOVE : 2
};
var Bus = function() {

	this.data = {};
	this.activityBuses = [];

	this.topicMatch = function(topic, topicSpec) {
		var regexp = topicSpec.replace(new RegExp("\\.", "g"), "\\.");

		regexp = regexp.replace(new RegExp("\\*\\*", "g"), "??");
		regexp = regexp.replace(new RegExp("\\*", "g"), "[^\.]+");
		regexp = regexp.replace(new RegExp("\\?\\?", "g"), "([^\.]+\.?)+");

		var res = topic.match(new RegExp("^" + regexp + "$"));

		return res != null && res[0] == topic;
	};

	this.createBus = function() {
		var ab = new ActivityBus(this);
		this.activityBuses.push(ab);
		return ab;
	};

	this.removeBus = function(activityBus) {
		var i = 0;
		for (i = 0; i < this.activityBuses.length; i++) {
			var value = this.activityBuses[i];
			if (value === activityBus) {
				this.activityBuses.splice(i, 1);
				i--;
			}
		}
	};

	var self = this;
	var notifyAll = function(notifyType, topic, object) {
		var i = 0;
		for (i = 0; i < self.activityBuses.length; i++) {
			self.activityBuses[i].notifyData(notifyType, topic, object);
		}
	};
	
	this.publishData = function(topic, object, activityBus) {
		if (!this.data[topic]) {
			this.data[topic] = [];
		}
		this.data[topic].push({
			payload : object,
			activityBus : activityBus
		});
		notifyAll(BusNotifyType.ADD,topic,object);
	};

	this.unpublishData = function(topic, object, activityBus) {
		var arr = this.data[topic];
		var i = 0;
		for (i = 0; i < arr.length; i++) {
			var value = arr[i];
			if (value.payload === object && value.activityBus === activityBus) {
				arr.splice(i, 1);
				i--;
				notifyAll(BusNotifyType.REMOVE,topic,object);
			}
		}
	};

	this.readData = function(topicSpec) {
		var ret = {};
		for ( var topic in this.data) {
			if (this.topicMatch(topic, topicSpec)) {
				var arr = this.data[topic];
				var payloads = [];
				for ( var i in arr) {
					payloads.push(arr[i].payload);
				}
				ret[topic] = payloads;
			}
		}
		return ret;
	};

	this.destroyData = function(activityBus) {
		for ( var topic in this.data) {
			var arr = this.data[topic];
			var i = 0;
			for (i = 0; i < arr.length; i++) {
				var value = arr[i];
				if (value.activityBus === activityBus) {
					arr.splice(i, 1);
					i--;
					notifyAll(BusNotifyType.REMOVE,topic,value.payload);
				}
			}
		}
	};

};

var ActivityBus = function(bus) {

	this.subscriptions = new Array();

	this.bus = bus;

	this.publish = function(topic, object) {
		bus.publishData(topic, object, this);
	};

	this.unpublish = function(topic, object) {
		bus.unpublishData(topic, object, this);
	};

	this.subscribe = function(topicSpec, onDataChanged) {
		var subscription = new Subscription(this, topicSpec, onDataChanged);
		this.subscriptions.push(subscription);
		return subscription;
	};
	
	this.subscribeTopic = function(topic, onDataChanged) {
		return this.subscribe(topic,function(added,removed) {
			onDataChanged(added[topic]||[],removed[topic]||[]);
		});
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

	this.notifyData = function(action, topic, object) {
		for (var i = 0; i < this.subscriptions.length; i++) {

			var s = this.subscriptions[i];
			var collector = s.createOrGetNotifyCollector();

			if (this.bus.topicMatch(topic, s.topicSpec)) {

				if (action == BusNotifyType.ADD) {
					collector.addChange(topic, object);
				} else if (action == BusNotifyType.REMOVE) {
					collector.addRemove(topic, object);
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

};

var Subscription = function(activityBus, topicSpec, onDataChanged) {

	this.topicSpec = topicSpec;
	this.onDataChanged = onDataChanged;
	this.notifyCollector = null;

	this.remove = function() {
		activityBus.unsubscribe(this);
	};

	this.readTopics = function() {
		return activityBus.bus.readData(this.topicSpec);
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

};

var NotifyCollector = function(subscription) {

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

	this.addChange = function(topic, object) {
		if (!this.pendingChanges[topic]) {
			this.pendingChanges[topic] = [];
		}
		this.removeIfFind(this.pendingRemoval[topic], object);
		this.pendingChanges[topic].push(object);

	};

	this.addRemove = function(topic, object) {
		if (!this.pendingRemoval[topic]) {
			this.pendingRemoval[topic] = [];
		}
		this.removeIfFind(this.pendingChanges[topic], object);
		this.pendingRemoval[topic].push(object);
	};
	
	this.removeIfFind = function(list, object) {
		if (list) {
			var i = 0;
			for (i = 0; i < list.length; i++) {
				if (list[i] == object) {
					list.splice(i, 1);
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