
export default class Common {

	static initializeTest(testName) {
		const headerTextBorderChar = '#';
		const headerTextWidth = 60;
		const headerTextBorderWidth = 4;

		const repeat = (str, length) => Array(length + 1).join(str);

		const headerTextRemainingSpaces = Math.max(0, headerTextWidth - 2 * headerTextBorderWidth - testName.length);
		const headerTextRemainingSpacesHalf = Math.floor(headerTextRemainingSpaces / 2);

		const textContentBorder = repeat(headerTextBorderChar, headerTextBorderWidth);
		const textContentName = testName;
		const textContentSpacesBefore = repeat(' ', Math.max(1, headerTextRemainingSpacesHalf));
		const textContentSpacesAfter = repeat(' ', Math.max(1, ((headerTextRemainingSpaces % 2) == 1) ? headerTextRemainingSpacesHalf + 1 : headerTextRemainingSpacesHalf));

		const textBorder = repeat(headerTextBorderChar, headerTextWidth);
		
		console.log(' ');
		console.log(textBorder);
		console.log(textContentBorder + textContentSpacesBefore + textContentName + textContentSpacesAfter + textContentBorder);
		console.log(textBorder);
	} 
}