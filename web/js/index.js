const rankup = document.getElementById("rankup");
const activeUsers = document.getElementById("active-users");

let output = "";
rankup.onclick = () => doClick("/rankup/");
activeUsers.onclick = () => doClick("/active-users/");

function doClick(endpoint) {
	const userId = document.getElementById("user").value;

	if (isNaN(userId) || userId === "") {
		output = "that's not a valid user!";
		updateScreen();
	} else fetch(endpoint + userId).then(async res => {
			output = await res.text();
			updateScreen();
		});
}
function updateScreen() {
	document.getElementById("output").innerHTML = output;
}