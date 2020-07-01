import { createGrid, getRectStack } from './get-rect-stack';
import { getNodeFromTree } from '../../core/utils';

/**
 * Return all elements that are at the center bounding rect of the passed in node.
 * @method getElementStack
 * @memberof axe.commons.dom
 * @param {Node} node
 * @return {Node[]}
 */
function getElementStack(node) {
	// TODO: es-module-_cache
	if (!axe._cache.get('gridCreated')) {
		createGrid();
		axe._cache.set('gridCreated', true);
	}

	const vNode = getNodeFromTree(node);
	const grid = vNode._grid;

	if (!grid) {
		return [];
	}

	return getRectStack(grid, vNode.boundingClientRect);
}

export default getElementStack;
