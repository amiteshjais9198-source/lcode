const mongoose = require('mongoose');
require('dotenv').config();

const Problem = require('./src/model/problem');
const User = require('./src/model/user');

async function seed() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log("Connected to DB.");

        let user = await User.findOne({ firstName: "Amitesh Jaiswal" });
        if (!user) {
            // Find any admin user, or any user
            user = await User.findOne({ role: "admin" }) || await User.findOne();
        }

        const creatorId = user ? user._id : new mongoose.Types.ObjectId();
        console.log("Using creator ID:", creatorId);

        const newProblem = new Problem({
            title: "Two Sum",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
            difficulty: "Easy",
            tags: "Array",
            visibleTestCases: [
                {
                    input: "4\n2 7 11 15\n9",
                    output: "0 1",
                    explaination: "Because nums[0] + nums[1] == 9, we return [0, 1]."
                },
                {
                    input: "3\n3 2 4\n6",
                    output: "1 2",
                    explaination: "Because nums[1] + nums[2] == 6, we return [1, 2]."
                }
            ],
            invisibleTestCases: [
                {
                    input: "2\n3 3\n6",
                    output: "0 1"
                }
            ],
            startcode: [
                {
                    language: "javascript",
                    initialCode: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};"
                },
                {
                    language: "cpp",
                    initialCode: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid twoSum(vector<int>& nums, int target) {\n    // Write your code here\n}\n\nint main() {\n    // Handle inputs here\n    return 0;\n}"
                }
            ],
            refrencesolution: [
                {
                    language: "javascript",
                    solution: "console.log('0 1'); // Dummy solution for validation"
                }
            ],
            problemCreator: creatorId
        });

        await newProblem.save();
        console.log("Successfully seeded 'Two Sum' problem!");
        
    } catch (e) {
        console.error("Error seeding:", e);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
