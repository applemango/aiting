import { Router } from "../../hook/useSpa.js";

export const router = new Router();

export const reImportPage = async (href) => {
  await router.replacePage(href);
  const meta = document.querySelector('meta[name="loadscript"]');
  const src = meta.getAttribute("src");
  const module = await import(src);
  const app = module.App;
  app.render();
  registerAllMetaTags(() => {
    app.patch();
  });
};

export const registerAllMetaTags = (fn) => {
  return Array.from(document.querySelectorAll("meta[state_id]")).map((meta) =>
    registerMetaTag(meta, fn),
  );
};

/**
 * @param {Function} fn
 * @returns [MutationObserver, Array<MutationObserver>]
 */
export const registerAllMetaTagsInHead = (fn) => {
  console.log("registerAllMetaTagsInHead");
  /** @type [Array<string>, Array<MutationObserver>] */
  let [metas_id, observers] = [new Array(), new Array()];
  const _fn = () => {
    console.log("changeHead");

    // 応急処置 パフォーマンスが下がる
    observers.map((o) => o.disconnect());
    metas_id = [];
    observers = [];

    Array.from(document.querySelectorAll("meta[state_id]")).map((meta) => {
      const id = meta.attributes.getNamedItem("state_id").value;
      if (metas_id.includes(id)) {
        return;
      }
      metas_id.push(id);
      observers.push(registerMetaTag(meta, fn));
    });
  };
  _fn();
  return [registerHead(document.querySelector("head"), _fn), observers];
};

export const registerHead = (head, fn) => {
  console.log("registerHead", head);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        fn(mutation);
      }
    });
  });

  observer.observe(head, {
    childList: true,
  });
  return observer;
};

export const registerMetaTag = (meta, fn) => {
  console.log("register", meta);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" || mutation.type === "childList") {
        fn(mutation);
      }
    });
  });

  observer.observe(meta, {
    attributes: true,
    childList: true,
    /*
     * 多分いらない
     * ```
     * characterData: true,
     * subtree: true
     * ```
     */
  });

  // disconnectとかする用
  return observer;
};
