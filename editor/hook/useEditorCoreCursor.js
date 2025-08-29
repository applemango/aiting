//@ts-check

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))


/**
 * @typedef {import("./useEditorCore").Line} Line
 * 
 * @typedef useEditorCursorApi
 * @property {(line: Line, offset: number)=> Promise<boolean>} setCursorPosition
 * @property {(line: Line, offset?: number)=> Promise<boolean>} focus 
 */

/**
 * @param {{
 *  editor: import("./useEditorCore").useEditorCoreApi
 * }} api
 */
export const useEditorCoreCursor = (api) => {
    /**
     * @param {Line} line
     * @param {number} offset 
     * @returns {Promise<Boolean>}
     */
    const setCursorPosition = (line, offset) => {
        return new Promise((resolve, reject) => {
            wait(50).then(()=> {
                const ref = api.editor.getLineRef(line)
                if(ref) {
                    //console.log(line.text, offset, ref, ref.innerHTML)
                    const range = document.createRange();
                    const sel = window.getSelection();
                    if(ref.nodeName == "#text") {
                        range.setStart(ref, offset);
                    } else {
                        range.setStart(ref, Math.min(1, offset));
                    }
                    range.collapse(true);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                    return resolve(true)
                }
                resolve(false)
            })
        })
    }
    /**
     * 
     * @param {Line} line 
     * @param {number} [offset]
     * @returns {Promise<boolean>}
     */
    const focus = async (line, offset = line?.text?.length) => {
       if(!line) return false
       //console.log("focus", line, offset)
       return await setCursorPosition(line, offset)
    }
    return {
        setCursorPosition,
        focus
    }
}