/*eslint-env node */
'use strict';

const { roles, aria: props } = require('aria-query');
const mdTable = require('markdown-table');
const format = require('../shared/format');

module.exports = function(grunt) {
	grunt.registerMultiTask(
		'aria-supported',
		'Task for generating a diff of supported aria roles and properties.',
		function() {
			const entry = this.data.entry;
			const destFile = this.data.destFile;
			const listType = this.data.listType.toLowerCase();

			/**
			 * `axe` has to be dynamically required at this stage, as `axe` does not exist until grunt task `build:uglify` is complete, and hence cannot be required at the top of the file.
			 */
			const axe = require('../../axe');

			/**
			 * As `aria-query` roles map, does not list all aria attributes in its props,
			 * the below reduce function aims to concatanate and unique the below two,
			 * - list from props with in roles map
			 * - list from aria map
			 *
			 * @return {Map} `aQaria` - This gives a composite list of aria attributes, which is later used to diff against axe-core supported attributes.
			 */
			const ariaKeys = Array.from(props).map(([key]) => key);
			const roleAriaKeys = Array.from(roles).reduce((out, [name, rule]) => {
				return [...out, ...Object.keys(rule.props)];
			}, []);
			const aQaria = new Set(axe.utils.uniqueArray(roleAriaKeys, ariaKeys));
			let footnotes;

			/**
			 * Parse a list of unsupported exception elements and add a footnote
			 * detailing which HTML elements are supported.
			 * @param {Array<String|Object>} elements List of supported elements
			 */
			const generateSupportFootnote = elements => {
				let supportedElements = elements.map(element => {
					if (typeof element === 'string') {
						return `\`<${element}>\``;
					}

					/**
					 * if element is not a string it will be an object with structure:
					 	{
							nodeName: string,
							properties: {
								type: {string|string[]}
							}
					 	}
					 */
					return Object.keys(element.properties).map(prop => {
						const value = element.properties[prop];

						// the 'type' property can be a string or an array
						if (typeof value === 'string') {
							return `\`<${element.nodeName} ${prop}="${value}">\``;
						}

						// output format for an array of types:
						// <input type="button" | "checkbox">
						let values = value.map(v => `"${v}"`).join(' | ');
						return `\`<${element.nodeName} ${prop}=${values}>\``;
					});
				});
				footnotes.push(
					'Supported on elements: ' + supportedElements.join(', ')
				);
			};

			/**
			 * Given a `base` Map and `subject` Map object,
			 * The function converts the `base` Map entries to an array which is sorted then enumerated to compare each entry against the `subject` Map
			 * The function constructs a `string` to represent a `markdown table` to
			 * @param {Map} base Base Map Object
			 * @param {Map} subject Subject Map Object
			 * @return {Array[]} Example Output: [ [ 'alert', 'No' ], [ 'figure', 'Yes' ] ]
			 */
			const getDiff = (base, subject) => {
				return Array.from(base.entries())
					.sort()
					.reduce((out, [key] = item) => {
						switch (listType) {
							case 'supported':
								if (
									subject.hasOwnProperty(key) &&
									subject[key].unsupported === false
								) {
									out.push([`${key}`, 'Yes']);
								}
								break;
							case 'unsupported':
								if (
									(subject[key] && subject[key].unsupported === true) ||
									!subject.hasOwnProperty(key)
								) {
									out.push([`${key}`, 'No']);
								} else if (
									subject[key] &&
									subject[key].unsupported &&
									subject[key].unsupported.exceptions
								) {
									out.push([`${key}`, `Mixed[^${footnotes.length + 1}]`]);
									generateSupportFootnote(subject[key].unsupported.exceptions);
								}
								break;
							case 'all':
							default:
								out.push([
									`${key}`,
									subject.hasOwnProperty(key) &&
									subject[key].unsupported === false
										? 'Yes'
										: 'No'
								]);
								break;
						}
						return out;
					}, []);
			};

			const getMdContent = (
				heading,
				rolesTable,
				attributesTable,
				footnotes
			) => {
				return `${heading}\n\n## Roles\n\n${rolesTable}\n\n## Attributes\n\n${attributesTable}\n\n${footnotes}`;
			};

			const generateDoc = () => {
				footnotes = [];

				const content = getMdContent(
					`# ARIA Roles and Attributes ${
						listType === 'all' ? 'available' : listType
					} in axe-core.\n\n` +
						'It can be difficult to know which features of web technologies are accessible across ' +
						'different platforms, and with different screen readers and other assistive technologies. ' +
						'Axe-core does some of this work for you, by raising issues when accessibility features are ' +
						'used that are known to cause problems.\n\n' +
						'This page contains a list of ARIA 1.1 features that axe-core raises as unsupported. ' +
						'For more information, read [We’ve got your back with “Accessibility Supported” in axe]' +
						'(https://www.deque.com/blog/weve-got-your-back-with-accessibility-supported-in-axe/).\n\n' +
						'For a detailed description about how accessibility support is decided, see [How we make ' +
						'decisions on rules](accessibility-supported.md).',
					mdTable([
						['aria-role', 'axe-core support'],
						...getDiff(roles, axe.commons.aria.lookupTable.role)
					]),
					mdTable([
						['aria-attribute', 'axe-core support'],
						...getDiff(aQaria, axe.commons.aria.lookupTable.attributes)
					]),
					footnotes.map((footnote, index) => `[^${index + 1}]: ${footnote}`)
				);

				// Format the content so Prettier doesn't create a diff after running.
				// See https://github.com/dequelabs/axe-core/issues/1310.
				const formattedContent = format(content, destFile);
				grunt.file.write(destFile, formattedContent);
			};

			generateDoc();
		}
	);
};
