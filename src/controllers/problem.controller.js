import db from '../libs/db.js'

export  const createProblem = async (req, res) => {
    const {title, description, difficulty, ags, examples, constraints, testcases, codeSnippet, referenceSolution } = req.body;

    if(req.body.role !== "ADMIN"){
        return res.status(403).json({error: "You are not allowed to create a problem"})
    }
    
    try {
        for(const [language, solutionCode] of Object.entries(referenceSolution)){
            const languageId = getJudge0LanguageId(language)
            if(!languageId) {
                return res.status(400).json({error: `Language ${language} is not supported`})
            }

            const submissions = testcases.map((input, output) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))

            const submissionResult = await submitBatch(submissions)
        }
    } catch (error) {
        
    }
}
export  const getAllProblems = async (req, res) => {}
export  const getAllProblemById = async (req, res) => {}
export  const updateProblem = async (req, res) => {}
export  const deleteProblem = async (req, res) => {}
export  const getAllProblemsSolvedByUser = async (req, res) => {}
