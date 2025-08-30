//@ts-check
import { Box, IfBox, Style } from "../components/box.js";
import { useAccount } from "./hook/useAccount.js";
import { useEditor } from "./hook/useEditor.js";
import { useEffect } from "../hook/useEffect.js";
import { component } from "../src/dom/virtualdom.js";
import { useFeatures } from "./hook/useFeatures.js";
import { useSettings } from "./hook/useSettings.js";
import { AitingAppModeSelector } from "./aitingAppModeSelector.js";
import { AitingAppLine } from "./aitingAppLine.js";
import {
  AitingAppInfiniteGenerateActivateButton,
  AitingAppInfiniteGenerateWrapper,
} from "./aitingAppAutoGenerate.js";
import { AitingAppCopyButton } from "./aitingAppCopyButton.js";
import { useWrittingMode } from "./hook/useWrittingMode.js";

//https://materialui.co/colors

export const AitingApp = component(({ init }) => {
  const [account, setAccount] = useAccount();
  const [settings, setSettings] = useSettings();
  const { currentMode } = useWrittingMode();

  const feature = useFeatures({ settings: settings(), mode: currentMode() });

  const { copy, state, api } = useEditor({ settings: settings(), feature });

  useEffect(
    "init",
    () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      wait(300).then(() => {
        init(api);
      });
    },
    [],
  );

  return Box(
    { class: "AitingAppContainer" },
    Style({ file: "/editor/aiting.css" }),

    Box({ class: "AitingAppModeSelectorContainer" }, AitingAppModeSelector({})),

    Box(
      { class: "AitingAppBodyContainer" },
      AitingAppInfiniteGenerateWrapper({
        api,
        children: Box(
          {},
          state().map((line, i) =>
            AitingAppLine({ line, api: { ...api, feature }, i }),
          ),
        ),
      }),
    ),

    IfBox(
      Boolean(state().length < 3 && Boolean(state()[0].text)) &&
        Boolean(feature.autoGenerate),
      {},
      AitingAppInfiniteGenerateActivateButton({}),
    ),

    IfBox(
      Boolean(feature.copy),
      {},
      AitingAppCopyButton({
        onClick: () => copy().then(() => alert("copied!")),
      }),
    ),
  );
});
