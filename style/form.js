let main = document.getElementById("main");
let form = document.getElementById("form");
let btn = document.getElementById("btn");

// console.log("script working");

btn.onclick = function () {
	// console.log("button pressed");
	form.style.display = "flex";
	main.style.display = "none";
	// btn.style.backgroundColor = "red";
};
