const uniqueLandmarks = [];
return results.filter(currentResult => {
	const findMatch = someResult => {
		return (
			currentResult.data.role === someResult.data.role &&
			currentResult.data.label === someResult.data.label
		);
	};

	const matchedResult = uniqueLandmarks.find(findMatch);
	if (matchedResult) {
		matchedResult.result = false;
		matchedResult.relatedNodes.push(currentResult.relatedNodes[0]);
		return false;
	}

	uniqueLandmarks.push(currentResult);
	currentResult.relatedNodes = [];
	return true;
});
