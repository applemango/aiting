import { getMetaTag } from "../src/dom/dom.js"
import { ArrayToFlat } from "../src/utils/array.js"

export const useEffect = (id, fn, arr = []) => {
    const element = getMetaTag(id)
    const isChanged = () => {
        const values = ArrayToFlat(arr).map((d)=> JSON.stringify(d)).join("").concat(".")
        if(element.innerText != values) {
            element.innerText = values
            fn()
        }
    }
    isChanged()
}