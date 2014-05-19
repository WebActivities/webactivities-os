var Stack = function() {
	this.top = null;
	this.count = 0;

	this.getCount = function() {
		return this.count;
	};

	this.getTop = function() {
		return this.top;
	};

	this.push = function(data) {
		var node = {
			data : data,
			next : null
		};

		node.next = this.top;
		this.top = node;

		this.count++;
	};

	this.peek = function() {
		if (this.top === null) {
			return null;
		} else {
			return this.top.data;
		}
	};

	this.pop = function() {
		if (this.top === null) {
			return null;
		} else {
			var out = this.top;
			this.top = this.top.next;
			if (this.count > 0) {
				this.count--;
			}

			return out.data;
		}
	};

	this.getAll = function() {
		if (this.top === null) {
			return null;
		} else {
			var arr = new Array();

			var current = this.top;
			// console.log(current);
			for (var i = 0; i < this.count; i++) {
				arr[i] = current.data;
				current = current.next;
			}

			return arr;
		}
	};
	
	
	this.forEach = function(fn) {
		var current = this.top;
		for (var i = 0; i < this.count; i++) {
			if (!fn(current.data)) {
				return;
			}
			current = current.next;
		}
	};
	
};