/**
 * @typedef Tool
 * @property {string} type - Type of tool (e.g. "function")
 * @property {object} function
 * @property {function} function.function - Function to be executed {location: string}
 * @property {string} function.name - Name of function (e.g. "getTemperature") 
 * @property {string} function.description - Description of what the function does
 * @property {object} function.parameters - Parameters object
 * @property {string} function.parameters.type - Type of parameters (e.g. "object")
 * @property {object} function.parameters.properties - Properties of parameters
 * @property {string[]} function.parameters.required - Array of required parameter names
 */

import { getGroqChatCompletion } from "./groq"

/**
 * @param {Array<Tool>} tools
 * @param {*} messages
 */
const getGroqChatCompletionWithTools = async (tools, messages) => {
    
    const resultMessage = messages.concat()

    const toolUseRes = await getGroqChatCompletion({
        messages,
        tools: tools
            .concat()
            .map((tool)=> ({
                type: tool.type,
                function: {
                    name: tool.function.name,
                    description: tool.function.description,
                    parameters: tool.function.parameters
                }
            })),
        tool_choice: "auto",
    })
    const toolUseResJson = await toolUseRes.json()

    const toolUseResJsonMessage = toolUseResJson.choices[0].message
    resultMessage.push(toolUseResJsonMessage)

    const toolCalls = toolUseResJsonMessage.tool_calls || []

    for(const tool of toolCalls) {
        const toolName = tool.function.name
        const toolArgs = JSON.parse(tool.function.arguments)

        const useTool = tools.find((tool) => tool.function.name === toolName)
        const toolFunction = useTool.function.function

        const toolId = tool.id

        const toolResult = await toolFunction(toolArgs)

        resultMessage.push({
            tool_call_id: toolId,
            role: "tool",
            name: toolName,
            content: JSON.stringify(toolResult)
        })
    }

    return resultMessage
}

export {
    getGroqChatCompletionWithTools
}