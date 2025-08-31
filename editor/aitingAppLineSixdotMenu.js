//@ts-check
import { Box, Icon, IfBox, Text } from "../components/box.js";
import { useEffect } from "../hook/useEffect.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { component } from "../src/dom/virtualdom.js";

/**
 * @typedef {Array<{action: (e: any)=> void, icon: string, name: string}>} Menu
 */

/**
 * @type {typeof component<{menu: Menu, id: string}>}
 */
const AitingAppLineSixdotComponent = component;
export const AitingAppLineSixdot = AitingAppLineSixdotComponent(
  ({ menu, id }) => {
    const [open, setOpen] = useState(id.concat("_sixDropDownOpen"), false);

    useEffect(id.concat("_sixDropDownOpenEffect"), () => {
      window.addEventListener("mousedown", (e) => {
        if (!e.target) return;
        const el = document
          .getElementsByClassName(id.concat("_sixDotDropDownClass"))
          .item(0);
        if (el && !el.contains(e.target)) setOpen(false);
      });
    });

    return Box(
      {
        attr: { class: id.concat("_sixDotDropDownClass") },
      },
      Icon({ name: "sixdot", onClick: () => setOpen(true) }),
      IfBox(
        open(),
        { attr: { class: "dropdown" } },
        menu.map((m) =>
          Box(
            {
              attr: { class: "dropdownMenuItem" },
              onClick: (e) => {
                setOpen(false);
                m.action(e);
              },
            },
            Icon({ name: m.icon }),
            Text(m.name, {
              style: s({
                fontSize: "14px",
                margin: "0",
                color: "#EC407A",
              }),
            }),
          ),
        ),
      ),
    );
  },
);
