const fs = require('fs');
const path = require('path');

const seedContent = `const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CodePulse database...');

  await prisma.activity.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.solution.deleteMany();
  await prisma.studentQuestionProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);

  // 1. Staff / Admin Users (No dummy students)
  const admin = await prisma.user.create({
    data: { name: 'System Admin', email: 'admin@codepulse.dev', passwordHash: hash, role: 'ADMIN' }
  });
  const mentor1 = await prisma.user.create({
    data: { name: 'Dr. Vikramaditya (Striver)', email: 'vikram@codepulse.dev', passwordHash: hash, role: 'MENTOR' }
  });
  const mentor2 = await prisma.user.create({
    data: { name: 'Ananya Sharma (Staff Coach)', email: 'ananya@codepulse.dev', passwordHash: hash, role: 'MENTOR' }
  });

  // 2. 30 Comprehensive DSA Questions Bank (Authored by Mentors/Admin)
  const qList = [
    { title: 'Two Sum', topic: 'Arrays', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/two-sum/', tags: ['array', 'hash-table'], description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', creatorId: mentor1.id },
    { title: 'Best Time to Buy and Sell Stock', topic: 'Arrays', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', tags: ['array', 'dynamic-programming'], description: 'Maximize profit by choosing a single day to buy one stock and choosing a different day in the future to sell.', creatorId: mentor1.id },
    { title: 'Valid Parentheses', topic: 'Stack', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/valid-parentheses/', tags: ['stack', 'string'], description: 'Given a string containing just brackets, determine if the input string is valid.', creatorId: mentor2.id },
    { title: 'Merge Two Sorted Lists', topic: 'Linked Lists', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', tags: ['linked-list', 'recursion'], description: 'Merge two sorted linked lists and return it as a sorted list.', creatorId: mentor1.id },
    { title: 'Maximum Subarray (Kadane)', topic: 'Dynamic Programming', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/maximum-subarray/', tags: ['array', 'dynamic-programming'], description: 'Find the contiguous subarray with the largest sum.', creatorId: mentor2.id },
    { title: 'Invert Binary Tree', topic: 'Trees', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/invert-binary-tree/', tags: ['tree', 'binary-tree'], description: 'Given the root of a binary tree, invert the tree, and return its root.', creatorId: mentor1.id },
    { title: 'Binary Tree Level Order Traversal', topic: 'Trees', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', tags: ['tree', 'breadth-first-search'], description: 'Return the level order traversal of binary tree nodes values.', creatorId: mentor2.id },
    { title: 'Lowest Common Ancestor of BST', topic: 'BST', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', tags: ['tree', 'bst'], description: 'Find the lowest common ancestor (LCA) node of two given nodes in the BST.', creatorId: mentor1.id },
    { title: 'Number of Islands', topic: 'Graphs', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/number-of-islands/', tags: ['matrix', 'dfs', 'bfs'], description: 'Given an m x n 2D grid of 1s (land) and 0s (water), count the number of islands.', creatorId: mentor1.id },
    { title: 'Course Schedule', topic: 'Graphs', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/course-schedule/', tags: ['graph', 'topological-sort'], description: 'Determine if you can finish all courses given prerequisite dependencies.', creatorId: mentor2.id },
    { title: 'Trapping Rain Water', topic: 'Arrays', difficulty: 'HARD', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/trapping-rain-water/', tags: ['two-pointers', 'stack'], description: 'Compute how much water an elevation map can trap after raining.', creatorId: mentor1.id },
    { title: 'Median of Two Sorted Arrays', topic: 'Binary Search', difficulty: 'HARD', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', tags: ['binary-search'], description: 'Return median of two sorted arrays in O(log(m+n)) runtime.', creatorId: admin.id },
    { title: 'Word Ladder', topic: 'Graphs', difficulty: 'HARD', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/word-ladder/', tags: ['bfs', 'string'], description: 'Return the number of words in the shortest transformation sequence from beginWord to endWord.', creatorId: mentor1.id },
    { title: 'Longest Palindromic Substring', topic: 'Strings', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', tags: ['string', 'dp'], description: 'Return the longest palindromic substring in string s.', creatorId: mentor2.id },
    { title: 'Group Anagrams', topic: 'Strings', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/group-anagrams/', tags: ['hash-table', 'sorting'], description: 'Group anagrams together from an array of strings.', creatorId: mentor1.id },
    { title: 'Reverse Linked List', topic: 'Linked Lists', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/reverse-linked-list/', tags: ['linked-list'], description: 'Reverse a singly linked list iteratively or recursively.', creatorId: mentor2.id },
    { title: 'Linked List Cycle', topic: 'Linked Lists', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/linked-list-cycle/', tags: ['two-pointers', 'floyd'], description: 'Determine if the linked list has a cycle using fast and slow pointers.', creatorId: mentor2.id },
    { title: 'Implement Queue using Stacks', topic: 'Queue', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/implement-queue-using-stacks/', tags: ['stack', 'queue'], description: 'Implement FIFO queue using two stacks.', creatorId: mentor1.id },
    { title: 'Min Stack', topic: 'Stack', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/min-stack/', tags: ['stack', 'design'], description: 'Design a stack that supports push, pop, top, and retrieving min in O(1).', creatorId: mentor2.id },
    { title: 'Binary Search', topic: 'Binary Search', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/binary-search/', tags: ['binary-search'], description: 'Find target integer in ascending sorted array.', creatorId: mentor1.id },
    { title: 'Search in Rotated Sorted Array', topic: 'Binary Search', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', tags: ['binary-search'], description: 'Search target in sorted array that has been rotated.', creatorId: mentor1.id },
    { title: 'Find Minimum in Rotated Sorted Array', topic: 'Binary Search', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', tags: ['binary-search'], description: 'Find minimum element in rotated sorted array in O(log n).', creatorId: mentor2.id },
    { title: 'Top K Frequent Elements', topic: 'Heap', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', tags: ['heap', 'hash-table'], description: 'Return k most frequent elements from array.', creatorId: mentor1.id },
    { title: 'Kth Largest Element in Array', topic: 'Heap', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', tags: ['heap', 'quickselect'], description: 'Find the kth largest element in an unsorted array.', creatorId: mentor2.id },
    { title: 'Climbing Stairs', topic: 'Dynamic Programming', difficulty: 'EASY', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/climbing-stairs/', tags: ['dp', 'fibonacci'], description: 'Count distinct ways to climb n stairs taking 1 or 2 steps.', creatorId: mentor1.id },
    { title: 'Coin Change', topic: 'Dynamic Programming', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/coin-change/', tags: ['dp', 'knapsack'], description: 'Fewest coins needed to make up a given amount.', creatorId: mentor1.id },
    { title: 'Subsets', topic: 'Backtracking', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/subsets/', tags: ['backtracking'], description: 'Return all possible subsets (the power set).', creatorId: mentor2.id },
    { title: 'Permutations', topic: 'Backtracking', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/permutations/', tags: ['backtracking'], description: 'Return all possible permutations of distinct integers.', creatorId: mentor1.id },
    { title: 'Merge Intervals', topic: 'Sorting', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/merge-intervals/', tags: ['sorting', 'intervals'], description: 'Merge all overlapping intervals.', creatorId: mentor1.id },
    { title: 'LRU Cache', topic: 'Linked Lists', difficulty: 'MEDIUM', platform: 'LeetCode', problemUrl: 'https://leetcode.com/problems/lru-cache/', tags: ['design', 'doubly-linked-list'], description: 'Design Least Recently Used cache with get and put in O(1).', creatorId: admin.id },
  ];

  const createdQuestions = [];
  for (const q of qList) {
    const question = await prisma.question.create({
      data: {
        title: q.title,
        topic: q.topic,
        difficulty: q.difficulty,
        platform: q.platform,
        problemUrl: q.problemUrl,
        tags: q.tags,
        description: q.description,
        visibility: 'PUBLIC',
        createdById: q.creatorId,
      }
    });
    createdQuestions.push(question);
  }

  const twoSum = createdQuestions[0];
  const stock = createdQuestions[1];

  // 3. Official Mentor Reference Solutions
  await prisma.solution.create({
    data: {
      questionId: twoSum.id,
      userId: mentor1.id,
      language: 'C++',
      sourceCode: '#include <vector>\\n#include <unordered_map>\\nusing namespace std;\\n\\nclass Solution {\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {\\n        unordered_map<int, int> numMap;\\n        for (int i = 0; i < nums.size(); i++) {\\n            int complement = target - nums[i];\\n            if (numMap.find(complement) != numMap.end()) {\\n                return {numMap[complement], i};\\n            }\\n            numMap[nums[i]] = i;\\n        }\\n        return {};\\n    }\\n};',
      explanation: 'Use an unordered_map to store numbers and indices for O(1) complement lookup.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
    }
  });

  await prisma.solution.create({
    data: {
      questionId: twoSum.id,
      userId: mentor2.id,
      language: 'Python',
      sourceCode: 'class Solution:\\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\\n        seen = {}\\n        for i, val in enumerate(nums):\\n            diff = target - val\\n            if diff in seen:\\n                return [seen[diff], i]\\n            seen[val] = i\\n        return []',
      explanation: 'Single-pass dictionary lookup in Python.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
    }
  });

  await prisma.solution.create({
    data: {
      questionId: stock.id,
      userId: mentor1.id,
      language: 'Java',
      sourceCode: 'class Solution {\\n    public int maxProfit(int[] prices) {\\n        int minP = Integer.MAX_VALUE, maxP = 0;\\n        for (int p : prices) {\\n            if (p < minP) minP = p;\\n            else if (p - minP > maxP) maxP = p - minP;\\n        }\\n        return maxP;\\n    }\\n}',
      explanation: 'Greedy one pass tracking minimum price seen so far.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
    }
  });

  // 4. Comments from Mentors
  await prisma.comment.create({
    data: {
      questionId: twoSum.id,
      userId: mentor1.id,
      content: 'Trading O(n) space for O(n) time is the quintessential DSA trade-off. Master hash tables first!'
    }
  });

  console.log('Seeding completed without dummy students. Clean slate ready for real users!');
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
`;

fs.writeFileSync(path.join(__dirname, '../prisma/seed.js'), seedContent, 'utf8');
console.log('Wrote clean prisma/seed.js');
