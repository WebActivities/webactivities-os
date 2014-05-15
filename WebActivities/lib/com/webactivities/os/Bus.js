var Bus = function() {

	this.data = {};
	this.activityBuses = [];

	this.topicMatch = function(topic, topicSpec) {
		function endsWith(str, suffix) {
			return str.indexOf(suffix, str.length - suffix.length) !== -1;
		}
		var regexp = topicSpec.replace(new RegExp("\\.", "g"), "\\.");
		if (endsWith(topicSpec, "*")) {
			regexp = regexp.replace(new RegExp("\\*$"), ".+");
		}

		regexp = regexp.replace(new RegExp("\\*"), "[^\.]+");

		return topic.match(new RegExp("^" + regexp + "$"));
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

	this.publishData = function(topic, object, activityBus) {
		if (!this.data[topic]) {
			this.data[topic] = [];
		}
		this.data[topic].push({
			payload : object,
			activityBus : activityBus
		});
		var i = 0;
		for (i = 0; i < this.activityBuses.length; i++) {
			this.activityBuses[i].notifyData("add", topic, object);
		}
	};

	this.unpublishData = function(topic, object, activityBus) {
		var arr = this.data[topic];
		var i = 0;
		for (i = 0; i < arr.length; i++) {
			var value = arr[i];
			if (value.payload === object && value.activityBus === activityBus) {
				arr.splice(i, 1);
				i--;
				var x = 0;
				for (x = 0; x < this.activityBuses.length; x++) {
					this.activityBuses[x].notifyData("remove", topic, object);
				}
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
			if (this.bus.topicMatch(topic, s.topicSpec)) {
				if (typeof (s.onDataChanged) == "function") {
					s.onDataChanged(action, topic, object);
				}
			}
		}
	};

	this.destroy = function() {
		bus.removeBus(this);
		bus.destroyData(this);
	};

};

var Subscription = function(activityBus, topicSpec, onDataChanged) {

	this.topicSpec = topicSpec;
	this.onDataChanged = onDataChanged;

	this.remove = function() {
		activityBus.unsubscribe(this);
	};

	this.readTopics = function() {
		return activityBus.bus.readData(this.topicSpec);
	};

};

function testBus() {

	var b = new Bus();
	var ab1 = b.createBus();
	var sub1 = ab1.subscribe("it.eng.*", function(action, topic, value) {
		console.log("1) " + action + " on topic " + topic + ": " + value);
	});

	var sub2 = ab1.subscribe("it.*.pippo", function(action, topic, value) {
		console.log("2) " + action + " on topic " + topic + ": " + value);
	});

	var sub3 = ab1.subscribe("it.eng.pippo", function(action, topic, value) {
		console.log("3) " + action + " on topic " + topic + ": " + value);
	});

	var ab2 = b.createBus();
	ab2.publish("it.eng.pippo", "Ciao!");
	ab2.unpublish("it.eng.pippo", "Ciao!");

	ab2.publish("it.eng.pippo.pluto", "Hello!");

	console.log(sub1.readTopics());
	console.log(sub2.readTopics());
	console.log(sub3.readTopics());

	sub1.remove();
	ab2.publish("it.eng.pippo", "Ciao!");

	ab2.destroy();

	console.log(sub1.readTopics());
	console.log(sub2.readTopics());
	console.log(sub3.readTopics());

}