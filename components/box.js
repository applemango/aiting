//@ts-check
import { component, h } from "../src/dom/virtualdom.js";

/**
 * @typedef {import("../src/dom/virtualdom").VNodeProps} VNodeProps
 * @typedef {import("../src/dom/virtualdom").VNodeChild} VNodeChild
 * @typedef {import("../src/dom/virtualdom").VNodeChildren} VNodeChildren
 * @typedef {import("../src/dom/virtualdom").VNode} VNode
 */

/**
 * @param {VNodeProps} props
 * @param  {...VNodeChild | VNodeChildren} children
 * @returns {VNode}
 */
export const Box = (props, ...children) => h("div", props, ...children);

/**
 * @param {boolean} bool
 * @param {VNodeProps} props
 * @param  {...VNodeChild | VNodeChildren} children
 * @returns {VNode}
 */
export const IfBox = (bool, props, ...children) =>
  bool ? Box(props, ...children) : Box({});

/**
 * @param {{file: string}} param0
 */
export const Style = ({ file }) =>
  h("link", { attr: { rel: "stylesheet", href: file } });

/**
 * @type {typeof component<{name: string} & VNodeProps>}
 */
const IconComponent = component;
export const Icon = IconComponent(({ name, attr, ...props }) => {
  return h("img", {
    ...props,
    attr: { ...attr, src: `/editor/icon/${name}.svg` },
  });
});

/**
 * @param {string} text
 * @param {VNodeProps} [prop]
 * @returns
 */
export const Text = (text, prop) => {
  return h("p", prop || {}, text);
};
