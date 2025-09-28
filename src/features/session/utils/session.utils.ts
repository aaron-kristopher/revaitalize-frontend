export const getPredictionEvaluation = (prediction: number[]): string => {
	if (!prediction || !prediction.includes(1)) {
		return "Correct";
	}
	// A simplified example of error mapping. This can be expanded.
	if (prediction[0] && prediction[1] && prediction[2] && prediction[3] && prediction[4] && prediction[5]) return "Upper Body Misalignment";
	else if (prediction[0] && prediction[1] && prediction[2] && prediction[3]) return "Forearm Misalignment";
	else if (prediction[0] || prediction[1]) return "Shoulder Misalignment";
	else if (prediction[2] || prediction[3]) return "Elbow Misalignment";
	else if (prediction[4] || prediction[5]) return "Wrist Misalignment";
	return "Incorrect Form";
};

export const getMostFrequentError = (predictions: number[][]): string => {
	const errorCount: Record<string, number> = {};
	let maxCount = 0;
	let frequentError = "No Error";

	for (const pred of predictions) {
		const evaluation = getPredictionEvaluation(pred);
		if (evaluation !== "Correct") {
			errorCount[evaluation] = (errorCount[evaluation] || 0) + 1;
		}
	}

	for (const error in errorCount) {
		if (errorCount[error] > maxCount) {
			maxCount = errorCount[error];
			frequentError = error;
		}
	}
	return frequentError;
};
