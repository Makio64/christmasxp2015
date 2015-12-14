function getWorkerInstance(script) {
	var URL = window.URL || window.webkitURL;

	if (URL == undefined || window.Blob == undefined || window.Worker == undefined || script == undefined) {
		return null;
	}

	var blob = new Blob([script]);
	var oURL = URL.createObjectURL(blob);
	var worker = new Worker(oURL);
	URL.revokeObjectURL(oURL);
	return worker;
}