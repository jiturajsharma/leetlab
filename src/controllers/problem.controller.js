import { db } from "../libs/db.js";
import { pollBatchResults, submitBatch, getJudge0LanguageId } from "../libs/Judge0.lib.js";

export const createProblem = async (req, res) => {
    const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
} = req.body;

  // going to check the user role once again

try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
    const languageId = getJudge0LanguageId(language);

    if (!languageId) {
        return res
        .status(400)
        .json({ error: `Language ${language} is not supported` });
    }

      //
        const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
        }));

        const submissionResults = await submitBatch(submissions);

        const tokens = submissionResults.map((res) => res.token);

        const results = await pollBatchResults(tokens);

        for (let i = 0; i < results.length; i++) {
        const result = results[i];
        // console.log("Result-----", result);
        // console.log(
        //   `Testcase ${i + 1} and Language ${language} ----- result ${JSON.stringify(result.status.description)}`
        // );
        if (result.status.id !== 3) {
            return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
            });
        }
        }
    }

    const newProblem = await db.problem.create({
        data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
        },
    });

    return res.status(201).json({
        sucess: true,
        message: "Message Created Successfully",
        problem: newProblem,
    });
    } catch (error) {
    console.log(error);
    return res.status(500).json({
        error: "Error While Creating Problem",
    });
    }
};

export const getAllProblems = async (req, res) => {
    try {
        const problems = await db.problem.findMany();
        if(!problems){
            return res.status(404).json({
                error: "No problem found"
            })
        }
        res.status(200).json({
            sucess: true,
            message: "Message Fetched Successfully",
            problems
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error while creating problems"
        })
    }
};
export const getAllProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        const problem = await db.problem.findUnique(
            {
                where: (
                    id
                )
            }
        )
        if(!problem){
            return res.status(404).json({error: "Problem is not found"})
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Error while fetching problem nby id"
        })
    }
};
export const updateProblem = async (req, res) => {
const { id } = req.params;
    const {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
    } = req.body;

    try {
        // Check if the problem exists
        const existingProblem = await db.problem.findUnique({
            where: { id: Number(id) },
        });

        if (!existingProblem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        // Validate each reference solution for the testcases, similar to createProblem
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                return res.status(400).json({
                    error: `Language ${language} is not supported`,
                });
            }

            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            const submissionResults = await submitBatch(submissions);
            const tokens = submissionResults.map((res) => res.token);

            const results = await pollBatchResults(tokens);

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status.id !== 3) {
                    return res.status(400).json({
                        error: `Testcase ${i + 1} failed for language ${language}`,
                    });
                }
            }
        }

        // Update the problem in the database
        const updatedProblem = await db.problem.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippets,
                referenceSolutions,
                userId: req.user.id, // assuming the user ID is still the same
            },
        });

        return res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            problem: updatedProblem,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error while updating the problem",
        });
    }
};
export const deleteProblem = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the problem exists
        const existingProblem = await db.problem.findUnique({
            where: { id: Number(id) },
        });

        if (!existingProblem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        // Delete the problem
        await db.problem.delete({
            where: { id: Number(id) },
        });

        return res.status(200).json({
            success: true,
            message: "Problem deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error while deleting the problem",
        });
    }

};
export const getAllProblemsSolvedByUser = async (req, res) => {};
