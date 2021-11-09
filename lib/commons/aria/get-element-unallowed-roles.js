import isValidRole from './is-valid-role';
import getImplicitRole from './implicit-role';
import getRoleType from './get-role-type';
import isAriaRoleAllowedOnElement from './is-aria-role-allowed-on-element';
import { tokenList, isHtmlElement, getNodeFromTree } from '../../core/utils';
import AbstractVirtuaNode from '../../core/base/virtual-node/abstract-virtual-node';

// dpub roles which are subclassing roles that are implicit on some native
// HTML elements (img, link, etc.)
const dpubRoles = [
  'doc-backlink',
  'doc-biblioentry',
  'doc-biblioref',
  'doc-cover',
  'doc-endnote',
  'doc-glossref',
  'doc-noteref'
];

const landmarkRoles = {
  header: 'banner',
  footer: 'contentinfo'
};

const tableRoles = {
  tr: 'row'
};

/**
 * Returns all roles applicable to element in a list
 *
 * @method getRoleSegments
 * @private
 * @param {Element} node
 * @returns {Array} Roles list or empty list
 */

function getRoleSegments(vNode) {
  let roles = [];

  if (!vNode) {
    return roles;
  }

  if (vNode.hasAttr('role')) {
    const nodeRoles = tokenList(vNode.attr('role').toLowerCase());
    roles = roles.concat(nodeRoles);
  }

  // filter invalid roles
  roles = roles.filter(role => isValidRole(role));

  return roles;
}

/**
 * gets all unallowed roles for a given node
 * @method getElementUnallowedRoles
 * @param {Element|VirtualNode} node HTMLElement to validate
 * @param {String} allowImplicit option to allow implicit roles, defaults to true
 * @return {Array<String>} retruns an array of roles that are not allowed on the given node
 */
function getElementUnallowedRoles(node, allowImplicit = true) {
  const vNode =
    node instanceof AbstractVirtuaNode ? node : getNodeFromTree(node);
  const { nodeName } = vNode.props;

  // by pass custom elements
  if (!isHtmlElement(vNode)) {
    return [];
  }

  const roleSegments = getRoleSegments(vNode);
  const implicitRole = getImplicitRole(vNode);

  // stores all roles that are not allowed for a specific element most often an element only has one explicit role
  const unallowedRoles = roleSegments.filter(role => {
    const roleIsImplicitRole =
      role === implicitRole ||
      // allow landmark roles to use their implicit role inside of another landmark
      // @see https://github.com/dequelabs/axe-core/pull/3142
      landmarkRoles[nodeName] === role;

    if (allowImplicit && roleIsImplicitRole) {
      return false;
    }

    // do not allow role=row when on TR when allowImplicit:false.
    // isAriaRoleAllowedOnElement always returns true if role is implicit
    const roleRowIsImplicitRole =
      role === implicitRole && tableRoles[nodeName] === role;
    if (roleRowIsImplicitRole) {
      return !allowImplicit;
    }

    // if role is a dpub role make sure it's used on an element with a valid
    // implicit role fallback
    if (dpubRoles.includes(role) && getRoleType(role) !== implicitRole) {
      return true;
    }

    // check if role is allowed on element
    return !isAriaRoleAllowedOnElement(vNode, role);
  });

  return unallowedRoles;
}

export default getElementUnallowedRoles;
