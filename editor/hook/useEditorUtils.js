//@ts-check

/**
 * @typedef useEditorUtilsApi
 * @property {()=> Promise<boolean>} copy
 */

/**
 * @param {{
 *  editor: import("./useEditorCore").useEditorCoreApi
 * }} api
 */
export const useEditorUtils = (api) => {
    /**
     * @returns {Promise<boolean>}
     */
    const copy = async () => {
        const string = [api.editor.getTitle(), api.editor.getContent()].join("\n")
        try {
            await navigator.clipboard.writeText(string)
            return true
        } catch {
            return false
        }
    }
    return {
        copy
    }
}