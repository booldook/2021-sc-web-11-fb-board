var numSteps = 20.0;

var boxElement;
var prevRatio = 0.0;
var increasingColor = "rgba(40, 40, 190, ratio)"; // 스크롤이 올라감에 따라 보이기 시작할 때
var decreasingColor = "rgba(190, 40, 40, ratio)"; // 스크롤이 내려감에 따라 사라지기 시작할 때

// Set things up
boxElement = document.querySelector("#box");
createObserver();

function createObserver() {
	var observer;
	var options = {
		root: null,
		rootMargin: "0px",
		// threshold: buildThresholdList()
		threshold: 0
	};

	observer = new IntersectionObserver(onIntersection, options);
	observer.observe(boxElement);
}

function buildThresholdList() {
	var thresholds = [];
	var numSteps = 20;

	for (var i = 1.0; i <= numSteps; i++) {
		var ratio = i / numSteps;
		thresholds.push(ratio);
	}

	thresholds.push(0);
	console.log(thresholds);
	return thresholds;
}

function onIntersection(el, observer) {
	el.forEach((v) => {
		// if (v.intersectionRatio > prevRatio) {
		console.log(v.isIntersecting);
		if(v.isIntersecting) {
			v.target.style.backgroundColor = increasingColor.replace("ratio", 1);
			observer.unobserve(v.target);
			// v.target.style.backgroundColor = increasingColor.replace("ratio", v.intersectionRatio);
		} 
		/* 
		else  {
			// v.target.style.backgroundColor = decreasingColor.replace("ratio", 1);
			// v.target.style.backgroundColor = decreasingColor.replace("ratio", v.intersectionRatio);
		}
		*/

		prevRatio = v.intersectionRatio;
	});
}