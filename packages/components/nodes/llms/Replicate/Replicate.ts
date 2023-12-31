import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { Replicate, ReplicateInput } from 'langchain/llms/replicate'

class Replicate_LLMs implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    description: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Replicate'
        this.name = 'replicate'
        this.type = 'Replicate'
        this.icon = 'replicate.svg'
        this.category = 'LLMs'
        this.description = 'Use Replicate to run open source models on cloud'
        this.baseClasses = [this.type, 'BaseChatModel', ...getBaseClasses(Replicate)]
        this.inputs = [
            {
                label: 'Replicate Api Key',
                name: 'replicateApiKey',
                type: 'password'
            },
            {
                label: 'Model',
                name: 'model',
                type: 'string',
                placeholder: 'a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5',
                optional: true
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                description:
                    'Adjusts randomness of outputs, greater than 1 is random and 0 is deterministic, 0.75 is a good starting value.',
                default: 0.7,
                optional: true
            },
            {
                label: 'Max Tokens',
                name: 'maxTokens',
                type: 'number',
                description: 'Maximum number of tokens to generate. A word is generally 2-3 tokens',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top Probability',
                name: 'topP',
                type: 'number',
                description:
                    'When decoding text, samples from the top p percentage of most likely tokens; lower to ignore less likely tokens',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Repetition Penalty',
                name: 'repetitionPenalty',
                type: 'number',
                description:
                    'Penalty for repeated words in generated text; 1 is no penalty, values greater than 1 discourage repetition, less than 1 encourage it. (minimum: 0.01; maximum: 5)',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Additional Inputs',
                name: 'additionalInputs',
                type: 'json',
                description:
                    'Each model has different parameters, refer to the specific model accepted inputs. For example: <a target="_blank" href="https://replicate.com/a16z-infra/llama13b-v2-chat/api#inputs">llama13b-v2</a>',
                additionalParams: true,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const modelName = nodeData.inputs?.model as string
        const apiKey = nodeData.inputs?.replicateApiKey as string
        const temperature = nodeData.inputs?.temperature as string
        const maxTokens = nodeData.inputs?.maxTokens as string
        const topP = nodeData.inputs?.topP as string
        const repetitionPenalty = nodeData.inputs?.repetitionPenalty as string
        const additionalInputs = nodeData.inputs?.additionalInputs as string

        const version = modelName.split(':').pop()
        const name = modelName.split(':')[0].split('/').pop()
        const org = modelName.split(':')[0].split('/')[0]

        const obj: ReplicateInput = {
            model: `${org}/${name}:${version}`,
            apiKey
        }

        let inputs: any = {}
        if (maxTokens) inputs.max_length = parseInt(maxTokens, 10)
        if (temperature) inputs.temperature = parseFloat(temperature)
        if (topP) inputs.top_p = parseFloat(topP)
        if (repetitionPenalty) inputs.repetition_penalty = parseFloat(repetitionPenalty)
        if (additionalInputs) {
            const parsedInputs =
                typeof additionalInputs === 'object' ? additionalInputs : additionalInputs ? JSON.parse(additionalInputs) : {}
            inputs = { ...inputs, ...parsedInputs }
        }
        if (Object.keys(inputs).length) obj.input = inputs

        const model = new Replicate(obj)
        return model
    }
}

module.exports = { nodeClass: Replicate_LLMs }
