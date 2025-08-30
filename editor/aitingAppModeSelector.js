//@ts-check
import { Box, Icon, Text } from "../components/box.js";
import { s } from "../src/dom/style.js";
import { component } from "../src/dom/virtualdom.js";
import { useWrittingMode } from "./hook/useWrittingMode.js";

/**
 * @type {typeof component<{}>}
 */
const AitingAppModeSelectorComponent = component;
export const AitingAppModeSelector = AitingAppModeSelectorComponent(({}) => {
  const { mode, modes, setMode, currentMode } = useWrittingMode();
  return Box(
    {
      style: s({
        display: "flex",
        gap: "16px",
        marginBottom: "32px",
        width: "max( 100%, 600px ) ",
        marginLeft: "32px",
        ...(mode() == -1
          ? {
              opacity: 1,
              transform: "translateX(0px) translateY(0px)",
            }
          : {}),
      }),
      class: "modeSelector",
    },
    modes.map((m) =>
      Box(
        {
          onClick: () => {
            setMode(m.id);
            console.log(m.id);
          },
          style: s({
            padding: "8px",
            boxShadow:
              "rgba(240, 46, 170, 0.4) 5px 5px, rgba(240, 46, 170, 0.3) 10px 10px, rgba(240, 46, 170, 0.2) 15px 15px, rgba(240, 46, 170, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px;",
            borderRadius: "4px",
            background: "#ffffff00",
            border: "1px solid #E91E63",
            //"backdrop-filter": "blur(4px)",
            cursor: "pointer",
            position: "relative",
            ...(mode() == m.id
              ? {
                  transform: "translateX(8px) translateY(8px)",
                }
              : {}),
          }),
          class: "modeSelectorButton",
        },
        Box(
          {
            style: s({
              display: "flex",
              gap: "8px",
            }),
          },
          Icon({
            name: m.ui.icon,
            style: s({
              width: "18px",
              position: "relative",
              zIndex: 2,
              stroke: "#EC407A",
            }),
          }),
          Text(m.ui.title, {
            style: s({
              fontSize: "14px",
              margin: "0",
              position: "relative",
              zIndex: 2,
              color: "#F50057",
            }),
          }),
        ),
        Text(m.ui.description, {
          style: s({
            margin: "0",
            fontSize: "12px",
            position: "relative",
            zIndex: 2,
            color: "#EC407A",
          }),
        }),
      ),
    ),
  );
});
