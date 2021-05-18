var numSteps = 50.0;

var prevRatio = 0.0;
var section = $("section").eq(1)[0];
createObserver();

function createObserver() {
	var observer;
	var options = {
		root: null,
		rootMargin: "0px",
		threshold: buildThresholdList()
	};

	observer = new IntersectionObserver(onIntersection, options);
	observer.observe(section);
}

function buildThresholdList() {
	var thresholds = [];
	var numSteps = 50;

	for (var i = 1.0; i <= numSteps; i++) {
		var ratio = i / numSteps;
		thresholds.push(ratio);
	}

	thresholds.push(0);
	console.log(thresholds);
	return thresholds;
}

function onIntersection(entries, observer) {
	entries.forEach(function(v) {
		if (v.intersectionRatio > prevRatio) {
			var deg = v.intersectionRatio * 90;
			console.log(deg);
			$('.box').css('transform', 'rotateX('+deg+'deg)');
		}
		else {
			var deg = v.intersectionRatio * 90;
			$('.box').css('transform', 'rotateX('+deg+'deg)');
		} 
		prevRatio = v.intersectionRatio;
	});
}