import { pollBatchResults, submitBatch } from "../libs/Judge0.lib.js"

export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
        
        const userId = req.user.id;
        
        //validate test cases is array or not
        if(!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) || expected_outputs.length !== stdin)
        {
            return res.status(400).json({error: 'Invalid or Missing test cases'})
        }

        // 2. prepare each test cases for judge0- batch submision
        const submissions = stdin.map((input) =>({ 
            source_code,
            language_id,
            stdin: input,
            base64_encoded:false,
            wait: false
        }));

        // 3. send batch of submission to judge0
        const submitResponse = await submitBatch(submissions);

        const tokens = submitResponse.map((res) => res.token);

        // 4. Poll judge0 for results of all submitted test cases
        const results = await pollBatchResults(tokens)

        console.log('Result--------------------------')
            console.log(results);

            res.status(200).json({
                message: "Code Executed!"
            })
    } catch (error) {
        
    }
}