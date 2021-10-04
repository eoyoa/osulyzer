const rankup = document.getElementById("rankup");
const activeUsers = document.getElementById("active-users");

rankup.onclick = () => doClick("/rankup/");
activeUsers.onclick = () => doClick("/active-users/");

function doClick(endpoint) {
	const userId = document.getElementById("user").value;

	updateScreen("loading...");
	if (isNaN(userId) || userId === "") {
		updateScreen("that's not a valid user!");
	} else fetch(endpoint + userId).then(async res => {
			updateScreen(await res.text());
		});
}
function updateScreen(text) {
	document.getElementById("output").innerHTML = text;
}