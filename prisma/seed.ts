import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Shared code boilerplate for tree problems (embedded into starter code so
// learners get a working TreeNode + array<->tree helpers for free).
// ---------------------------------------------------------------------------

const JS_TREE_HELPERS = `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (!arr.length || arr[0] === null || arr[0] === undefined) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length) {
      const leftVal = arr[i++];
      if (leftVal !== null && leftVal !== undefined) {
        node.left = new TreeNode(leftVal);
        queue.push(node.left);
      }
    }
    if (i < arr.length) {
      const rightVal = arr[i++];
      if (rightVal !== null && rightVal !== undefined) {
        node.right = new TreeNode(rightVal);
        queue.push(node.right);
      }
    }
  }
  return root;
}

function treeToArray(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }
  while (result.length && result[result.length - 1] === null) result.pop();
  return result;
}

`;

const PY_TREE_HELPERS = `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if i < len(arr):
            left_val = arr[i]
            i += 1
            if left_val is not None:
                node.left = TreeNode(left_val)
                queue.append(node.left)
        if i < len(arr):
            right_val = arr[i]
            i += 1
            if right_val is not None:
                node.right = TreeNode(right_val)
                queue.append(node.right)
    return root


def tree_to_array(root):
    if root is None:
        return []
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result


`;

type SeedProblem = {
  slug: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'BOSS';
  tags: string[];
  patternTags: string[];
  functionName: string;
  paramNames: string[];
  starterCode: { javascript: string; python: string };
  solutionCode: { javascript: string; python: string };
  whyThisProblem: string;
  testCases: { input: unknown[]; expected: unknown; isSample: boolean }[];
};

type SeedTopic = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  chapter: number;
  order: number;
  prerequisiteSlugs: string[];
  lessons: {
    slug: string;
    title: string;
    content: string;
    order: number;
    xpReward: number;
    quiz: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[];
  }[];
  problems: SeedProblem[];
};

const REWARD = {
  EASY: { xp: 50, coins: 10 },
  MEDIUM: { xp: 80, coins: 15 },
  HARD: { xp: 120, coins: 25 },
  BOSS: { xp: 220, coins: 50 },
};

const topics: SeedTopic[] = [
  // ---------------------------------------------------------------- Arrays
  {
    slug: 'arrays-strings',
    title: 'Arrays & Strings',
    description: 'The bread and butter of coding interviews: linear scans, hash maps, and string manipulation.',
    icon: 'Braces',
    chapter: 1,
    order: 0,
    prerequisiteSlugs: [],
    lessons: [
      {
        slug: 'arrays-101',
        title: 'Arrays & Hash Maps 101',
        order: 0,
        xpReward: 20,
        content: `## Why arrays first?

Arrays are the simplest way to store an ordered collection, and a huge share of interview
problems boil down to **"scan the array once, remember something useful as you go."**

The "something useful" is almost always a **hash map** (in JS: \`Map\` or a plain object; in
Python: \`dict\`). Hash maps give you O(1) average lookup, which turns an O(n²) brute-force scan
into an O(n) single pass.

### The pattern

\`\`\`
seen = {}
for i, value in enumerate(array):
    complement = target - value
    if complement in seen:
        return [seen[complement], i]
    seen[value] = i
\`\`\`

This single pattern — "have I seen what I need already?" — solves a surprising number of
problems: Two Sum, checking for duplicates, counting character frequencies, and more.

### Complexity intuition

- Nested loops comparing every pair → **O(n²)**
- One pass with a hash map → **O(n)** time, **O(n)** space

That space-for-time trade is the core idea to internalize before anything else in this course.`,
        quiz: [
          {
            prompt: 'What is the time complexity of looking up a key in a well-implemented hash map, on average?',
            choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correctIndex: 0,
            explanation: 'Hash maps give O(1) average-case lookup by hashing the key directly to a bucket.',
          },
          {
            prompt: 'Two Sum solved with a hash map runs in what time complexity?',
            choices: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
            correctIndex: 1,
            explanation: 'One pass through the array, with O(1) map lookups at each step, gives O(n) total.',
          },
        ],
      },
    ],
    problems: [
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'EASY',
        tags: ['arrays', 'hash-map'],
        patternTags: ['hash-map'],
        functionName: 'twoSum',
        paramNames: ['nums', 'target'],
        whyThisProblem: 'The canonical "have I seen this before?" hash map problem. Nail this pattern and a dozen others open up.',
        description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two
numbers that add up to \`target\`.

You may assume each input has exactly one solution, and you may not use the same element twice.

**Example**
\`\`\`
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]   // nums[0] + nums[1] === 9
\`\`\`

Return the indices in the order they appear in the array (smaller index first).`,
        starterCode: {
          javascript: `function twoSum(nums, target) {
  // TODO: return the indices of the two numbers that add up to target
}`,
          python: `def two_sum(nums, target):
    # TODO: return the indices of the two numbers that add up to target
    pass`,
        },
        solutionCode: {
          javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
          python: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []`,
        },
        testCases: [
          { input: [[2, 7, 11, 15], 9], expected: [0, 1], isSample: true },
          { input: [[3, 2, 4], 6], expected: [1, 2], isSample: true },
          { input: [[3, 3], 6], expected: [0, 1], isSample: false },
          { input: [[1, 2, 3, 4, 5], 9], expected: [3, 4], isSample: false },
        ],
      },
      {
        slug: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'EASY',
        tags: ['strings', 'hash-map'],
        patternTags: ['hash-map', 'frequency-count'],
        functionName: 'isAnagram',
        paramNames: ['s', 't'],
        whyThisProblem: 'Frequency counting with a hash map is the same pattern as Two Sum, applied to characters instead of numbers.',
        description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\`
otherwise.

**Example**
\`\`\`
Input: s = "anagram", t = "nagaram"
Output: true
\`\`\``,
        starterCode: {
          javascript: `function isAnagram(s, t) {
  // TODO: return true if t is an anagram of s
}`,
          python: `def is_anagram(s, t):
    # TODO: return True if t is an anagram of s
    pass`,
        },
        solutionCode: {
          javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const counts = {};
  for (const ch of s) counts[ch] = (counts[ch] || 0) + 1;
  for (const ch of t) {
    if (!counts[ch]) return false;
    counts[ch]--;
  }
  return true;
}`,
          python: `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in t:
        if counts.get(ch, 0) == 0:
            return False
        counts[ch] -= 1
    return True`,
        },
        testCases: [
          { input: ['anagram', 'nagaram'], expected: true, isSample: true },
          { input: ['rat', 'car'], expected: false, isSample: true },
          { input: ['a', 'a'], expected: true, isSample: false },
          { input: ['ab', 'a'], expected: false, isSample: false },
        ],
      },
      {
        slug: 'longest-substring-without-repeating',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'BOSS',
        tags: ['strings', 'sliding-window'],
        patternTags: ['sliding-window', 'hash-map'],
        functionName: 'lengthOfLongestSubstring',
        paramNames: ['s'],
        whyThisProblem: 'The boss battle of realm 1: combines the hash-map pattern with a shrinking/growing window, previewing realm 2.',
        description: `Given a string \`s\`, find the length of the longest substring without repeating
characters.

**Example**
\`\`\`
Input: s = "abcabcbb"
Output: 3   // "abc"
\`\`\`

**Example**
\`\`\`
Input: s = "bbbbb"
Output: 1   // "b"
\`\`\``,
        starterCode: {
          javascript: `function lengthOfLongestSubstring(s) {
  // TODO: return the length of the longest substring without repeats
}`,
          python: `def length_of_longest_substring(s):
    # TODO: return the length of the longest substring without repeats
    pass`,
        },
        solutionCode: {
          javascript: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let start = 0;
  let best = 0;
  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= start) {
      start = lastSeen.get(ch) + 1;
    }
    lastSeen.set(ch, end);
    best = Math.max(best, end - start + 1);
  }
  return best;
}`,
          python: `def length_of_longest_substring(s):
    last_seen = {}
    start = 0
    best = 0
    for end, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= start:
            start = last_seen[ch] + 1
        last_seen[ch] = end
        best = max(best, end - start + 1)
    return best`,
        },
        testCases: [
          { input: ['abcabcbb'], expected: 3, isSample: true },
          { input: ['bbbbb'], expected: 1, isSample: true },
          { input: ['pwwkew'], expected: 3, isSample: false },
          { input: [''], expected: 0, isSample: false },
          { input: ['dvdf'], expected: 3, isSample: false },
        ],
      },
    ],
  },

  // --------------------------------------------------------- Two Pointers
  {
    slug: 'two-pointers-sliding-window',
    title: 'Two Pointers & Sliding Window',
    description: 'Shrink O(n²) brute force into O(n) by moving two pointers toward each other or sliding a window across the array.',
    icon: 'MoveHorizontal',
    chapter: 1,
    order: 1,
    prerequisiteSlugs: ['arrays-strings'],
    lessons: [
      {
        slug: 'two-pointers-101',
        title: 'Two Pointers & Sliding Window 101',
        order: 0,
        xpReward: 20,
        content: `## Two flavors of the same idea

**Two pointers (opposite ends):** start one pointer at the front, one at the back, and move them
toward each other based on a comparison. Great for sorted arrays and "pair" problems.

**Sliding window:** keep a \`start\` and \`end\` pointer that both move forward, defining a
contiguous window. Grow the window until it breaks a constraint, then shrink it from the left
until the constraint holds again.

### When to reach for this pattern

- The problem mentions a **contiguous subarray/substring**.
- You're looking for a pair/triplet in a **sorted** array.
- A brute-force solution would check every pair or every window — that's your O(n²) signal.

### Sliding window skeleton

\`\`\`
left = 0
for right in range(len(arr)):
    # expand the window by including arr[right]
    while window_is_invalid():
        # shrink from the left
        left += 1
    # window [left, right] is now valid — update the answer
\`\`\`

Both pointers only ever move forward, so the total work is O(n), not O(n²).`,
        quiz: [
          {
            prompt: 'A sliding window problem where both pointers only ever move forward has what time complexity?',
            choices: ['O(n²)', 'O(n)', 'O(log n)', 'O(n³)'],
            correctIndex: 1,
            explanation: 'Each pointer traverses the array at most once, so total movement is bounded by 2n → O(n).',
          },
          {
            prompt: 'Two pointers starting at opposite ends of a sorted array are most useful for what kind of problem?',
            choices: ['Finding a pair with a target sum', 'Sorting the array', 'Reversing a linked list', 'Tree traversal'],
            correctIndex: 0,
            explanation: 'Sortedness lets you decide which pointer to move based on whether the current sum is too big or small.',
          },
        ],
      },
    ],
    problems: [
      {
        slug: 'valid-palindrome',
        title: 'Valid Palindrome',
        difficulty: 'EASY',
        tags: ['strings', 'two-pointer'],
        patternTags: ['two-pointer'],
        functionName: 'isPalindrome',
        paramNames: ['s'],
        whyThisProblem: 'The simplest possible two-pointer problem: pointers walk inward and compare.',
        description: `Given a string \`s\`, consider only alphanumeric characters and ignore case. Return \`true\` if
\`s\` reads the same forward and backward.

**Example**
\`\`\`
Input: s = "A man, a plan, a canal: Panama"
Output: true
\`\`\``,
        starterCode: {
          javascript: `function isPalindrome(s) {
  // TODO: return true if s is a palindrome, ignoring case and non-alphanumeric chars
}`,
          python: `def is_palindrome(s):
    # TODO: return True if s is a palindrome, ignoring case and non-alphanumeric chars
    pass`,
        },
        solutionCode: {
          javascript: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++; right--;
  }
  return true;
}`,
          python: `import re

def is_palindrome(s):
    clean = re.sub(r'[^a-z0-9]', '', s.lower())
    left, right = 0, len(clean) - 1
    while left < right:
        if clean[left] != clean[right]:
            return False
        left += 1
        right -= 1
    return True`,
        },
        testCases: [
          { input: ['A man, a plan, a canal: Panama'], expected: true, isSample: true },
          { input: ['race a car'], expected: false, isSample: true },
          { input: [' '], expected: true, isSample: false },
          { input: ['0P'], expected: false, isSample: false },
        ],
      },
      {
        slug: 'container-with-most-water',
        title: 'Container With Most Water',
        difficulty: 'MEDIUM',
        tags: ['arrays', 'two-pointer', 'greedy'],
        patternTags: ['two-pointer'],
        functionName: 'maxArea',
        paramNames: ['heights'],
        whyThisProblem: 'Teaches the "always move the shorter pointer" greedy insight that makes two pointers work on unsorted data.',
        description: `You are given an array \`heights\` where \`heights[i]\` is the height of a vertical line at
position \`i\`. Find two lines that, together with the x-axis, form a container that holds the
most water. Return the maximum amount of water it can store.

**Example**
\`\`\`
Input: heights = [1,8,6,2,5,4,8,3,7]
Output: 49
\`\`\``,
        starterCode: {
          javascript: `function maxArea(heights) {
  // TODO: return the maximum water a container can hold
}`,
          python: `def max_area(heights):
    # TODO: return the maximum water a container can hold
    pass`,
        },
        solutionCode: {
          javascript: `function maxArea(heights) {
  let left = 0, right = heights.length - 1, best = 0;
  while (left < right) {
    const area = Math.min(heights[left], heights[right]) * (right - left);
    best = Math.max(best, area);
    if (heights[left] < heights[right]) left++; else right--;
  }
  return best;
}`,
          python: `def max_area(heights):
    left, right = 0, len(heights) - 1
    best = 0
    while left < right:
        area = min(heights[left], heights[right]) * (right - left)
        best = max(best, area)
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    return best`,
        },
        testCases: [
          { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49, isSample: true },
          { input: [[1, 1]], expected: 1, isSample: true },
          { input: [[4, 3, 2, 1, 4]], expected: 16, isSample: false },
        ],
      },
      {
        slug: 'minimum-window-substring',
        title: 'Minimum Window Substring',
        difficulty: 'BOSS',
        tags: ['strings', 'sliding-window', 'hash-map'],
        patternTags: ['sliding-window', 'hash-map'],
        functionName: 'minWindow',
        paramNames: ['s', 't'],
        whyThisProblem: 'The hardest common sliding-window problem: a variable window with a frequency-count validity check.',
        description: `Given strings \`s\` and \`t\`, return the smallest substring of \`s\` that contains every
character of \`t\` (including duplicates). Return \`""\` if no such substring exists.

**Example**
\`\`\`
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
\`\`\``,
        starterCode: {
          javascript: `function minWindow(s, t) {
  // TODO: return the smallest substring of s containing all characters of t
}`,
          python: `def min_window(s, t):
    # TODO: return the smallest substring of s containing all characters of t
    pass`,
        },
        solutionCode: {
          javascript: `function minWindow(s, t) {
  if (!s || !t) return '';
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
  let missing = t.length;
  let left = 0, bestLen = Infinity, bestStart = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (need.has(ch)) {
      if (need.get(ch) > 0) missing--;
      need.set(ch, need.get(ch) - 1);
    }
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const leftCh = s[left];
      if (need.has(leftCh)) {
        need.set(leftCh, need.get(leftCh) + 1);
        if (need.get(leftCh) > 0) missing++;
      }
      left++;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
}`,
          python: `def min_window(s, t):
    if not s or not t:
        return ""
    need = {}
    for ch in t:
        need[ch] = need.get(ch, 0) + 1
    missing = len(t)
    left = 0
    best_len = float('inf')
    best_start = 0
    for right, ch in enumerate(s):
        if ch in need:
            if need[ch] > 0:
                missing -= 1
            need[ch] -= 1
        while missing == 0:
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_start = left
            left_ch = s[left]
            if left_ch in need:
                need[left_ch] += 1
                if need[left_ch] > 0:
                    missing += 1
            left += 1
    return "" if best_len == float('inf') else s[best_start:best_start + best_len]`,
        },
        testCases: [
          { input: ['ADOBECODEBANC', 'ABC'], expected: 'BANC', isSample: true },
          { input: ['a', 'a'], expected: 'a', isSample: true },
          { input: ['a', 'aa'], expected: '', isSample: false },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- Linked Lists
  {
    slug: 'linked-lists',
    title: 'Linked Lists',
    description: 'Pointer manipulation without an index. To keep the browser judge simple, lists are passed in and returned as arrays.',
    icon: 'Link2',
    chapter: 2,
    order: 2,
    prerequisiteSlugs: ['arrays-strings'],
    lessons: [
      {
        slug: 'linked-lists-101',
        title: 'Linked List Fundamentals',
        order: 0,
        xpReward: 20,
        content: `## Thinking in pointers, not indices

A linked list is a chain of nodes, each holding a value and a pointer to the next node. Unlike an
array, you can't jump to index \`i\` — you have to walk the chain.

> **A note on this course's judge:** to keep every problem runnable in a plain JavaScript/Python
> sandbox with JSON input/output, linked-list problems here take and return **plain arrays**
> instead of a custom \`ListNode\` class. The algorithms — and the interview conversation you'd have
> about them — are identical either way.

### The two patterns that matter most

**Fast & slow pointers**: one pointer moves one step at a time, the other moves two. Great for
finding the middle of a list or detecting a cycle.

**Dummy head**: when you're not sure what the new head of a list will be (reversing, merging,
deleting), create a placeholder \`dummy\` node before the real head so you never have to
special-case "is this the first node?".

### Reversing, step by step

\`\`\`
prev = null
current = head
while current:
    next_node = current.next
    current.next = prev
    prev = current
    current = next_node
return prev
\`\`\``,
        quiz: [
          {
            prompt: 'Why use a "dummy head" node when merging or reversing a linked list?',
            choices: [
              'It avoids special-casing the very first node',
              'It makes the list circular',
              'It speeds up traversal to O(log n)',
              "It's required by JavaScript syntax",
            ],
            correctIndex: 0,
            explanation: 'A dummy node gives you a stable "before the list" anchor so you never need an if-statement for the first node.',
          },
        ],
      },
    ],
    problems: [
      {
        slug: 'reverse-linked-list',
        title: 'Reverse Linked List',
        difficulty: 'EASY',
        tags: ['linked-list'],
        patternTags: ['pointer-reversal'],
        functionName: 'reverseList',
        paramNames: ['arr'],
        whyThisProblem: 'The foundational pointer-reversal pattern used everywhere linked lists show up.',
        description: `A singly linked list is given to you as an array, e.g. \`[1,2,3]\` represents \`1 -> 2 -> 3\`.
Return the array representing the reversed list.

**Example**
\`\`\`
Input: arr = [1,2,3,4,5]
Output: [5,4,3,2,1]
\`\`\`

(Yes, you could \`.reverse()\` an array in one line — but implement it by walking pointers, the way
you would with a real linked list, since that's the skill being tested.)`,
        starterCode: {
          javascript: `function reverseList(arr) {
  // TODO: reverse the list by walking pointers (prev/current), not Array.reverse()
}`,
          python: `def reverse_list(arr):
    # TODO: reverse the list by walking pointers (prev/current), not arr[::-1]
    pass`,
        },
        solutionCode: {
          javascript: `function reverseList(arr) {
  const result = [];
  for (let i = arr.length - 1; i >= 0; i--) result.push(arr[i]);
  return result;
}`,
          python: `def reverse_list(arr):
    result = []
    for i in range(len(arr) - 1, -1, -1):
        result.append(arr[i])
    return result`,
        },
        testCases: [
          { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1], isSample: true },
          { input: [[1, 2]], expected: [2, 1], isSample: true },
          { input: [[]], expected: [], isSample: false },
        ],
      },
      {
        slug: 'merge-two-sorted-lists',
        title: 'Merge Two Sorted Lists',
        difficulty: 'EASY',
        tags: ['linked-list', 'two-pointer'],
        patternTags: ['two-pointer', 'merge'],
        functionName: 'mergeTwoLists',
        paramNames: ['l1', 'l2'],
        whyThisProblem: 'The two-pointer merge is the building block behind merge sort and a very common interview follow-up.',
        description: `You're given two sorted lists \`l1\` and \`l2\` (as arrays). Merge them into one sorted array.

**Example**
\`\`\`
Input: l1 = [1,2,4], l2 = [1,3,4]
Output: [1,1,2,3,4,4]
\`\`\``,
        starterCode: {
          javascript: `function mergeTwoLists(l1, l2) {
  // TODO: merge two sorted arrays into one sorted array
}`,
          python: `def merge_two_lists(l1, l2):
    # TODO: merge two sorted arrays into one sorted array
    pass`,
        },
        solutionCode: {
          javascript: `function mergeTwoLists(l1, l2) {
  const result = [];
  let i = 0, j = 0;
  while (i < l1.length && j < l2.length) {
    if (l1[i] <= l2[j]) result.push(l1[i++]); else result.push(l2[j++]);
  }
  while (i < l1.length) result.push(l1[i++]);
  while (j < l2.length) result.push(l2[j++]);
  return result;
}`,
          python: `def merge_two_lists(l1, l2):
    result = []
    i = j = 0
    while i < len(l1) and j < len(l2):
        if l1[i] <= l2[j]:
            result.append(l1[i]); i += 1
        else:
            result.append(l2[j]); j += 1
    result.extend(l1[i:])
    result.extend(l2[j:])
    return result`,
        },
        testCases: [
          { input: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4], isSample: true },
          { input: [[], []], expected: [], isSample: true },
          { input: [[], [0]], expected: [0], isSample: false },
        ],
      },
      {
        slug: 'reorder-list',
        title: 'Reorder List',
        difficulty: 'BOSS',
        tags: ['linked-list', 'two-pointer'],
        patternTags: ['fast-slow-pointer', 'pointer-reversal'],
        functionName: 'reorderList',
        paramNames: ['arr'],
        whyThisProblem: 'Combines fast/slow pointers, list reversal, and merging into one boss-level problem.',
        description: `Given a list \`[L0, L1, ..., Ln]\` (as an array), reorder it in place to:
\`[L0, Ln, L1, Ln-1, L2, Ln-2, ...]\`

**Example**
\`\`\`
Input: arr = [1,2,3,4]
Output: [1,4,2,3]
\`\`\`

**Example**
\`\`\`
Input: arr = [1,2,3,4,5]
Output: [1,5,2,4,3]
\`\`\`

Return the reordered array.`,
        starterCode: {
          javascript: `function reorderList(arr) {
  // TODO: reorder to [L0, Ln, L1, Ln-1, L2, Ln-2, ...]
}`,
          python: `def reorder_list(arr):
    # TODO: reorder to [L0, Ln, L1, Ln-1, L2, Ln-2, ...]
    pass`,
        },
        solutionCode: {
          javascript: `function reorderList(arr) {
  const result = [];
  let left = 0, right = arr.length - 1;
  let takeLeft = true;
  while (left <= right) {
    if (takeLeft) result.push(arr[left++]);
    else result.push(arr[right--]);
    takeLeft = !takeLeft;
  }
  return result;
}`,
          python: `def reorder_list(arr):
    result = []
    left, right = 0, len(arr) - 1
    take_left = True
    while left <= right:
        if take_left:
            result.append(arr[left]); left += 1
        else:
            result.append(arr[right]); right -= 1
        take_left = not take_left
    return result`,
        },
        testCases: [
          { input: [[1, 2, 3, 4]], expected: [1, 4, 2, 3], isSample: true },
          { input: [[1, 2, 3, 4, 5]], expected: [1, 5, 2, 4, 3], isSample: true },
          { input: [[1]], expected: [1], isSample: false },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ Stacks/Queues
  {
    slug: 'stacks-queues',
    title: 'Stacks & Queues',
    description: 'LIFO and FIFO structures that power parsing, monotonic scans, and breadth-first search.',
    icon: 'Layers',
    chapter: 2,
    order: 3,
    prerequisiteSlugs: ['linked-lists'],
    lessons: [
      {
        slug: 'stacks-queues-101',
        title: 'Stacks, Queues & the Monotonic Stack',
        order: 0,
        xpReward: 20,
        content: `## Stack: last in, first out

A stack is perfect whenever you need to process nested or "most recent first" structure —
matching brackets, undo history, or DFS.

## Queue: first in, first out

A queue processes things in arrival order — think of it as a line at a coffee shop. Queues are
the backbone of breadth-first search (BFS) and task scheduling.

## The monotonic stack

A more advanced but extremely common pattern: keep a stack where values are always increasing (or
decreasing). Whenever a new value would break that order, pop elements off and use them to answer
a question like *"what's the next greater element?"* before pushing the new value.

\`\`\`
stack = []  # store indices
for i, value in enumerate(array):
    while stack and array[stack[-1]] < value:
        prev_index = stack.pop()
        # array[i] is the "next greater element" for array[prev_index]
    stack.append(i)
\`\`\`

Even though there's a \`while\` loop inside a \`for\` loop, every index is pushed once and popped at
most once — so the whole thing is still **O(n)**.`,
        quiz: [
          {
            prompt: 'A monotonic stack solution that looks like a nested loop is usually what time complexity?',
            choices: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2^n)'],
            correctIndex: 1,
            explanation: 'Each element is pushed once and popped at most once, so total work is bounded by 2n → O(n).',
          },
          {
            prompt: 'Which structure is the natural fit for breadth-first search?',
            choices: ['Stack', 'Queue', 'Hash map', 'Binary heap'],
            correctIndex: 1,
            explanation: 'BFS explores level by level, visiting nodes in the order they were discovered — exactly what a FIFO queue gives you.',
          },
        ],
      },
    ],
    problems: [
      {
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'EASY',
        tags: ['stack', 'strings'],
        patternTags: ['stack'],
        functionName: 'isValid',
        paramNames: ['s'],
        whyThisProblem: 'The textbook use case for a stack: matching the most recently opened bracket first.',
        description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, \`]\`, determine if
the input string is valid (every bracket is closed by the same type, in the correct order).

**Example**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`
**Example**
\`\`\`
Input: s = "(]"
Output: false
\`\`\``,
        starterCode: {
          javascript: `function isValid(s) {
  // TODO: return true if all brackets in s are matched and correctly nested
}`,
          python: `def is_valid(s):
    # TODO: return True if all brackets in s are matched and correctly nested
    pass`,
        },
        solutionCode: {
          javascript: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
          python: `def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        else:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return len(stack) == 0`,
        },
        testCases: [
          { input: ['()[]{}'], expected: true, isSample: true },
          { input: ['(]'], expected: false, isSample: true },
          { input: ['(('], expected: false, isSample: false },
          { input: [''], expected: true, isSample: false },
        ],
      },
      {
        slug: 'daily-temperatures',
        title: 'Daily Temperatures',
        difficulty: 'MEDIUM',
        tags: ['stack', 'arrays'],
        patternTags: ['monotonic-stack'],
        functionName: 'dailyTemperatures',
        paramNames: ['temperatures'],
        whyThisProblem: 'The cleanest introduction to the monotonic stack pattern from the lesson.',
        description: `Given an array \`temperatures\`, return an array \`answer\` where \`answer[i]\` is the number of
days you'd have to wait after day \`i\` to get a warmer temperature. If there is no future day for
which this is possible, put \`0\`.

**Example**
\`\`\`
Input: temperatures = [73,74,75,71,69,72,76,73]
Output: [1,1,4,2,1,1,0,0]
\`\`\``,
        starterCode: {
          javascript: `function dailyTemperatures(temperatures) {
  // TODO: for each day, how many days until a warmer temperature?
}`,
          python: `def daily_temperatures(temperatures):
    # TODO: for each day, how many days until a warmer temperature?
    pass`,
        },
        solutionCode: {
          javascript: `function dailyTemperatures(temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  const stack = [];
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
      const prevIndex = stack.pop();
      answer[prevIndex] = i - prevIndex;
    }
    stack.push(i);
  }
  return answer;
}`,
          python: `def daily_temperatures(temperatures):
    answer = [0] * len(temperatures)
    stack = []
    for i, temp in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temp:
            prev_index = stack.pop()
            answer[prev_index] = i - prev_index
        stack.append(i)
    return answer`,
        },
        testCases: [
          { input: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0], isSample: true },
          { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0], isSample: true },
          { input: [[30, 60, 90]], expected: [1, 1, 0], isSample: false },
        ],
      },
      {
        slug: 'largest-rectangle-in-histogram',
        title: 'Largest Rectangle in Histogram',
        difficulty: 'BOSS',
        tags: ['stack', 'arrays'],
        patternTags: ['monotonic-stack'],
        functionName: 'largestRectangleArea',
        paramNames: ['heights'],
        whyThisProblem: 'One of the hardest widely-asked monotonic stack problems — a real test of the pattern from this realm.',
        description: `Given an array \`heights\` representing histogram bar heights (width 1 each), return the area
of the largest rectangle that fits entirely within the histogram.

**Example**
\`\`\`
Input: heights = [2,1,5,6,2,3]
Output: 10   // the rectangle formed by bars [5,6] has height 5 and width 2
\`\`\``,
        starterCode: {
          javascript: `function largestRectangleArea(heights) {
  // TODO: return the area of the largest rectangle in the histogram
}`,
          python: `def largest_rectangle_area(heights):
    # TODO: return the area of the largest rectangle in the histogram
    pass`,
        },
        solutionCode: {
          javascript: `function largestRectangleArea(heights) {
  const stack = []; // indices, increasing height
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()];
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
      best = Math.max(best, height * width);
    }
    stack.push(i);
  }
  return best;
}`,
          python: `def largest_rectangle_area(heights):
    stack = []
    best = 0
    for i in range(len(heights) + 1):
        h = 0 if i == len(heights) else heights[i]
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            width = i - stack[-1] - 1 if stack else i
            best = max(best, height * width)
        stack.append(i)
    return best`,
        },
        testCases: [
          { input: [[2, 1, 5, 6, 2, 3]], expected: 10, isSample: true },
          { input: [[2, 4]], expected: 4, isSample: true },
          { input: [[1, 1, 1, 1]], expected: 4, isSample: false },
        ],
      },
    ],
  },

  // --------------------------------------------------------- Trees
  {
    slug: 'trees-recursion',
    title: 'Trees & Recursion',
    description: 'Recursive thinking, tree traversal, and the divide-and-conquer mindset that dynamic programming builds on.',
    icon: 'GitBranch',
    chapter: 3,
    order: 4,
    prerequisiteSlugs: ['stacks-queues'],
    lessons: [
      {
        slug: 'trees-101',
        title: 'Recursive Trees 101',
        order: 0,
        xpReward: 25,
        content: `## Trust the recursion

Most tree problems follow the same shape:

\`\`\`
def solve(node):
    if node is None:
        return base_case
    left_result = solve(node.left)
    right_result = solve(node.right)
    return combine(node.val, left_result, right_result)
\`\`\`

The trick to writing these quickly is to **trust the recursion**: assume \`solve(node.left)\` and
\`solve(node.right)\` already correctly solve the smaller subtrees, and just figure out how to
\`combine\` their results with the current node.

### This course's tree format

Trees are given as a level-order array with \`null\` for missing children — the same compact format
LeetCode uses, e.g. \`[4,2,7,1,3,6,9]\` is:

\`\`\`
        4
      /   \\
     2     7
    / \\   / \\
   1   3 6   9
\`\`\`

Every tree problem's starter code includes a \`buildTree\`/\`build_tree\` helper (and
\`treeToArray\`/\`tree_to_array\` when the answer is itself a tree) so you can focus on the
algorithm, not on parsing.`,
        quiz: [
          {
            prompt: 'In a recursive tree solution, what should you assume about the recursive calls on child nodes?',
            choices: [
              'That they might be wrong and need re-checking',
              'That they already correctly solve the smaller subtree',
              'That they always return null',
              'Nothing — recursion is unrelated to trees',
            ],
            correctIndex: 1,
            explanation: '"Trusting the recursion" — assuming correctness on smaller subtrees — is what makes tree recursion tractable.',
          },
        ],
      },
    ],
    problems: [
      {
        slug: 'maximum-depth-of-binary-tree',
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'EASY',
        tags: ['tree', 'recursion'],
        patternTags: ['tree-dfs'],
        functionName: 'maxDepth',
        paramNames: ['arr'],
        whyThisProblem: 'The simplest possible "trust the recursion" problem — the perfect first tree problem.',
        description: `Given the root of a binary tree (as a level-order array), return its maximum depth — the
number of nodes along the longest path from the root down to the farthest leaf.

**Example**
\`\`\`
Input: arr = [4,2,7,1,3,6,9]
Output: 3
\`\`\`

Your function receives the raw array; use the provided \`buildTree\`/\`build_tree\` helper to turn it
into a tree first.`,
        starterCode: {
          javascript: `${JS_TREE_HELPERS}function maxDepth(arr) {
  const root = buildTree(arr);
  // TODO: return the max depth of the tree rooted at root
}`,
          python: `${PY_TREE_HELPERS}def max_depth(arr):
    root = build_tree(arr)
    # TODO: return the max depth of the tree rooted at root
    pass`,
        },
        solutionCode: {
          javascript: `${JS_TREE_HELPERS}function maxDepth(arr) {
  const root = buildTree(arr);
  function depth(node) {
    if (!node) return 0;
    return 1 + Math.max(depth(node.left), depth(node.right));
  }
  return depth(root);
}`,
          python: `${PY_TREE_HELPERS}def max_depth(arr):
    root = build_tree(arr)

    def depth(node):
        if node is None:
            return 0
        return 1 + max(depth(node.left), depth(node.right))

    return depth(root)`,
        },
        testCases: [
          { input: [[4, 2, 7, 1, 3, 6, 9]], expected: 3, isSample: true },
          { input: [[1]], expected: 1, isSample: true },
          { input: [[]], expected: 0, isSample: false },
        ],
      },
      {
        slug: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        difficulty: 'MEDIUM',
        tags: ['tree', 'recursion'],
        patternTags: ['tree-dfs'],
        functionName: 'invertTree',
        paramNames: ['arr'],
        whyThisProblem: 'Return a transformed tree, not just a number — practice with treeToArray on the way out.',
        description: `Given the root of a binary tree (as a level-order array), invert it (swap every node's left
and right children) and return the level-order array of the inverted tree.

**Example**
\`\`\`
Input: arr = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]
\`\`\``,
        starterCode: {
          javascript: `${JS_TREE_HELPERS}function invertTree(arr) {
  const root = buildTree(arr);
  // TODO: invert the tree, then return treeToArray(root)
}`,
          python: `${PY_TREE_HELPERS}def invert_tree(arr):
    root = build_tree(arr)
    # TODO: invert the tree, then return tree_to_array(root)
    pass`,
        },
        solutionCode: {
          javascript: `${JS_TREE_HELPERS}function invertTree(arr) {
  const root = buildTree(arr);
  function invert(node) {
    if (!node) return;
    [node.left, node.right] = [node.right, node.left];
    invert(node.left);
    invert(node.right);
  }
  invert(root);
  return treeToArray(root);
}`,
          python: `${PY_TREE_HELPERS}def invert_tree(arr):
    root = build_tree(arr)

    def invert(node):
        if node is None:
            return
        node.left, node.right = node.right, node.left
        invert(node.left)
        invert(node.right)

    invert(root)
    return tree_to_array(root)`,
        },
        testCases: [
          { input: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1], isSample: true },
          { input: [[1]], expected: [1], isSample: true },
          { input: [[]], expected: [], isSample: false },
        ],
      },
      {
        slug: 'diameter-of-binary-tree',
        title: 'Diameter of Binary Tree',
        difficulty: 'BOSS',
        tags: ['tree', 'recursion'],
        patternTags: ['tree-dfs'],
        functionName: 'diameterOfBinaryTree',
        paramNames: ['arr'],
        whyThisProblem: 'The classic "compute two things at once" tree recursion — depth for the parent, but the answer might live entirely in a subtree.',
        description: `Given the root of a binary tree (as a level-order array), return the length (in edges) of the
longest path between any two nodes. The path does not need to pass through the root.

**Example**
\`\`\`
Input: arr = [1,2,3,4,5]
Output: 3   // the path 4 -> 2 -> 1 -> 3
\`\`\``,
        starterCode: {
          javascript: `${JS_TREE_HELPERS}function diameterOfBinaryTree(arr) {
  const root = buildTree(arr);
  // TODO: return the diameter (longest path between any two nodes, in edges)
}`,
          python: `${PY_TREE_HELPERS}def diameter_of_binary_tree(arr):
    root = build_tree(arr)
    # TODO: return the diameter (longest path between any two nodes, in edges)
    pass`,
        },
        solutionCode: {
          javascript: `${JS_TREE_HELPERS}function diameterOfBinaryTree(arr) {
  const root = buildTree(arr);
  let best = 0;
  function depth(node) {
    if (!node) return 0;
    const left = depth(node.left);
    const right = depth(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  }
  depth(root);
  return best;
}`,
          python: `${PY_TREE_HELPERS}def diameter_of_binary_tree(arr):
    root = build_tree(arr)
    best = 0

    def depth(node):
        nonlocal best
        if node is None:
            return 0
        left = depth(node.left)
        right = depth(node.right)
        best = max(best, left + right)
        return 1 + max(left, right)

    depth(root)
    return best`,
        },
        testCases: [
          { input: [[1, 2, 3, 4, 5]], expected: 3, isSample: true },
          { input: [[1, 2]], expected: 1, isSample: true },
          { input: [[1]], expected: 0, isSample: false },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- Dynamic Programming
  {
    slug: 'dynamic-programming',
    title: 'Dynamic Programming',
    description: 'Break a problem into overlapping subproblems, solve each once, and remember the answer.',
    icon: 'Network',
    chapter: 3,
    order: 5,
    prerequisiteSlugs: ['trees-recursion'],
    lessons: [
      {
        slug: 'dp-101',
        title: 'Dynamic Programming 101',
        order: 0,
        xpReward: 25,
        content: `## Recursion + memory = DP

Dynamic programming is recursion where the same subproblem gets solved **more than once** if you
don't store the answer. The fix: cache each subproblem's result the first time you compute it.

### Top-down (memoization)

\`\`\`
cache = {}
def solve(n):
    if n in cache:
        return cache[n]
    if n <= 1:
        return n
    result = solve(n - 1) + solve(n - 2)
    cache[n] = result
    return result
\`\`\`

### Bottom-up (tabulation)

Instead of recursing, build a table from the smallest subproblem up:

\`\`\`
dp = [0] * (n + 1)
dp[1] = 1
for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]
return dp[n]
\`\`\`

### Spotting a DP problem

Ask: *"Can I define the answer for size \`n\` in terms of the answer for smaller sizes?"* If yes,
and smaller subproblems repeat, you likely want DP. Common signals: "count the number of ways",
"minimum/maximum cost to reach...", "can you make exactly...".`,
        quiz: [
          {
            prompt: 'What turns plain recursion into dynamic programming?',
            choices: [
              'Using a while loop instead of recursion',
              'Caching (memoizing) results of subproblems so they are computed once',
              'Always sorting the input first',
              'Avoiding recursion entirely',
            ],
            correctIndex: 1,
            explanation: 'DP is recursion plus memoization (or an equivalent bottom-up table) so overlapping subproblems are solved once.',
          },
          {
            prompt: 'Which phrase is the strongest signal that a problem wants a DP approach?',
            choices: [
              '"Print all permutations"',
              '"Minimum cost to reach the end"',
              '"Sort the array"',
              '"Reverse the string"',
            ],
            correctIndex: 1,
            explanation: '"Minimum/maximum cost to reach..." almost always means the answer for position n depends on the answer for smaller positions.',
          },
        ],
      },
    ],
    problems: [
      {
        slug: 'climbing-stairs',
        title: 'Climbing Stairs',
        difficulty: 'EASY',
        tags: ['dp'],
        patternTags: ['dp-1d'],
        functionName: 'climbStairs',
        paramNames: ['n'],
        whyThisProblem: 'Fibonacci in disguise — the friendliest possible introduction to 1D DP.',
        description: `You're climbing a staircase with \`n\` steps. Each move you can climb 1 or 2 steps. In how
many distinct ways can you climb to the top?

**Example**
\`\`\`
Input: n = 3
Output: 3   // (1,1,1), (1,2), (2,1)
\`\`\``,
        starterCode: {
          javascript: `function climbStairs(n) {
  // TODO: return the number of distinct ways to climb n steps (1 or 2 at a time)
}`,
          python: `def climb_stairs(n):
    # TODO: return the number of distinct ways to climb n steps (1 or 2 at a time)
    pass`,
        },
        solutionCode: {
          javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2;
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}`,
          python: `def climb_stairs(n):
    if n <= 2:
        return n
    prev2, prev1 = 1, 2
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1`,
        },
        testCases: [
          { input: [2], expected: 2, isSample: true },
          { input: [3], expected: 3, isSample: true },
          { input: [5], expected: 8, isSample: false },
          { input: [1], expected: 1, isSample: false },
        ],
      },
      {
        slug: 'coin-change',
        title: 'Coin Change',
        difficulty: 'MEDIUM',
        tags: ['dp'],
        patternTags: ['dp-1d', 'unbounded-knapsack'],
        functionName: 'coinChange',
        paramNames: ['coins', 'amount'],
        whyThisProblem: 'The canonical unbounded-knapsack-style DP, and one of the most frequently asked DP problems in interviews.',
        description: `Given coin denominations \`coins\` and a target \`amount\`, return the fewest number of coins
needed to make up that amount. Return \`-1\` if it's not possible.

**Example**
\`\`\`
Input: coins = [1,2,5], amount = 11
Output: 3   // 5 + 5 + 1
\`\`\``,
        starterCode: {
          javascript: `function coinChange(coins, amount) {
  // TODO: return the fewest coins to make amount, or -1 if impossible
}`,
          python: `def coin_change(coins, amount):
    # TODO: return the fewest coins to make amount, or -1 if impossible
    pass`,
        },
        solutionCode: {
          javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
          python: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return -1 if dp[amount] == float('inf') else dp[amount]`,
        },
        testCases: [
          { input: [[1, 2, 5], 11], expected: 3, isSample: true },
          { input: [[2], 3], expected: -1, isSample: true },
          { input: [[1], 0], expected: 0, isSample: false },
        ],
      },
      {
        slug: 'longest-increasing-subsequence',
        title: 'Longest Increasing Subsequence',
        difficulty: 'BOSS',
        tags: ['dp'],
        patternTags: ['dp-1d'],
        functionName: 'lengthOfLIS',
        paramNames: ['nums'],
        whyThisProblem: 'The final boss: an O(n²) DP with a classic O(n log n) upgrade path, a favorite at top-tier interviews.',
        description: `Given an integer array \`nums\`, return the length of the longest strictly increasing
subsequence.

**Example**
\`\`\`
Input: nums = [10,9,2,5,3,7,101,18]
Output: 4   // [2,3,7,101]
\`\`\`

An O(n²) DP solution is enough to pass every test case here.`,
        starterCode: {
          javascript: `function lengthOfLIS(nums) {
  // TODO: return the length of the longest strictly increasing subsequence
}`,
          python: `def length_of_lis(nums):
    # TODO: return the length of the longest strictly increasing subsequence
    pass`,
        },
        solutionCode: {
          javascript: `function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  const dp = new Array(nums.length).fill(1);
  let best = 1;
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}`,
          python: `def length_of_lis(nums):
    if not nums:
        return 0
    dp = [1] * len(nums)
    best = 1
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        best = max(best, dp[i])
    return best`,
        },
        testCases: [
          { input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4, isSample: true },
          { input: [[0, 1, 0, 3, 2, 3]], expected: 4, isSample: true },
          { input: [[7, 7, 7, 7]], expected: 1, isSample: false },
        ],
      },
    ],
  },
];

const quests = [
  {
    key: 'daily-solve-2',
    title: 'Two down',
    description: 'Solve 2 problems today.',
    type: 'DAILY',
    goalType: 'SOLVE_PROBLEMS',
    goalTarget: 2,
    xpReward: 40,
    coinReward: 15,
    icon: 'Swords',
  },
  {
    key: 'daily-lesson-1',
    title: "Don't skip class",
    description: 'Complete 1 lesson today.',
    type: 'DAILY',
    goalType: 'COMPLETE_LESSON',
    goalTarget: 1,
    xpReward: 25,
    coinReward: 10,
    icon: 'BookOpen',
  },
  {
    key: 'daily-ai-1',
    title: 'Consult the sage',
    description: 'Ask Sage (the AI mentor) at least one question today.',
    type: 'DAILY',
    goalType: 'USE_AI_MENTOR',
    goalTarget: 1,
    xpReward: 15,
    coinReward: 5,
    icon: 'Sparkles',
  },
  {
    key: 'weekly-solve-10',
    title: 'Ten in the books',
    description: 'Solve 10 problems this week.',
    type: 'WEEKLY',
    goalType: 'SOLVE_PROBLEMS',
    goalTarget: 10,
    xpReward: 150,
    coinReward: 60,
    icon: 'Trophy',
  },
  {
    key: 'weekly-easy-5',
    title: 'Warm up',
    description: 'Solve 5 Easy problems this week.',
    type: 'WEEKLY',
    goalType: 'SOLVE_DIFFICULTY',
    goalTarget: 5,
    goalFilter: 'EASY',
    xpReward: 80,
    coinReward: 30,
    icon: 'Flame',
  },
];

const achievements = [
  {
    key: 'first-blood',
    title: 'First Blood',
    description: 'Solve your first problem.',
    icon: 'Trophy',
    criteriaType: 'TOTAL_SOLVES',
    criteriaTarget: 1,
    xpReward: 20,
    coinReward: 10,
  },
  {
    key: 'ten-solved',
    title: 'Momentum',
    description: 'Solve 10 problems.',
    icon: 'TrendingUp',
    criteriaType: 'TOTAL_SOLVES',
    criteriaTarget: 10,
    xpReward: 60,
    coinReward: 25,
  },
  {
    key: 'fifty-solved',
    title: 'Grinder',
    description: 'Solve 50 problems.',
    icon: 'Dumbbell',
    criteriaType: 'TOTAL_SOLVES',
    criteriaTarget: 50,
    xpReward: 200,
    coinReward: 80,
  },
  {
    key: 'week-streak',
    title: 'One Week Strong',
    description: 'Reach a 7-day streak.',
    icon: 'Flame',
    criteriaType: 'STREAK_DAYS',
    criteriaTarget: 7,
    xpReward: 80,
    coinReward: 30,
  },
  {
    key: 'month-streak',
    title: 'Unstoppable',
    description: 'Reach a 30-day streak.',
    icon: 'Flame',
    criteriaType: 'STREAK_DAYS',
    criteriaTarget: 30,
    xpReward: 300,
    coinReward: 100,
  },
  {
    key: 'first-boss',
    title: 'Boss Slayer',
    description: 'Defeat your first boss battle.',
    icon: 'Swords',
    criteriaType: 'BOSS_DEFEATED',
    criteriaTarget: 1,
    xpReward: 100,
    coinReward: 40,
  },
  {
    key: 'all-bosses',
    title: 'Realm Conqueror',
    description: 'Defeat every boss battle in the game.',
    icon: 'Crown',
    criteriaType: 'BOSS_DEFEATED',
    criteriaTarget: 6,
    xpReward: 400,
    coinReward: 150,
  },
  {
    key: 'topic-mastered',
    title: 'Specialist',
    description: 'Reach 90%+ mastery in a topic.',
    icon: 'Star',
    criteriaType: 'TOPIC_MASTERED',
    criteriaTarget: 1,
    xpReward: 100,
    coinReward: 40,
  },
  {
    key: 'level-10',
    title: 'Double Digits',
    description: 'Reach level 10.',
    icon: 'Sparkles',
    criteriaType: 'LEVEL_REACHED',
    criteriaTarget: 10,
    xpReward: 100,
    coinReward: 40,
  },
];

async function main() {
  console.log('Seeding DSA Quest...');

  for (const t of topics) {
    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        description: t.description,
        icon: t.icon,
        chapter: t.chapter,
        order: t.order,
        prerequisiteSlugs: t.prerequisiteSlugs,
      },
      create: {
        slug: t.slug,
        title: t.title,
        description: t.description,
        icon: t.icon,
        chapter: t.chapter,
        order: t.order,
        prerequisiteSlugs: t.prerequisiteSlugs,
      },
    });

    for (const l of t.lessons) {
      const lesson = await prisma.lesson.upsert({
        where: { topicId_slug: { topicId: topic.id, slug: l.slug } },
        update: { title: l.title, content: l.content, order: l.order, xpReward: l.xpReward },
        create: {
          topicId: topic.id,
          slug: l.slug,
          title: l.title,
          content: l.content,
          order: l.order,
          xpReward: l.xpReward,
        },
      });

      await prisma.quizQuestion.deleteMany({ where: { lessonId: lesson.id } });
      for (let i = 0; i < l.quiz.length; i++) {
        const q = l.quiz[i];
        await prisma.quizQuestion.create({
          data: {
            lessonId: lesson.id,
            prompt: q.prompt,
            choices: q.choices,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            order: i,
          },
        });
      }
    }

    for (let i = 0; i < t.problems.length; i++) {
      const p = t.problems[i];
      const reward = REWARD[p.difficulty];
      const problem = await prisma.problem.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          topicId: topic.id,
          tags: p.tags,
          patternTags: p.patternTags,
          xpReward: reward.xp,
          coinReward: reward.coins,
          isBossBattle: p.difficulty === 'BOSS',
          order: i,
          functionName: p.functionName,
          paramNames: p.paramNames,
          starterCode: p.starterCode,
          solutionCode: p.solutionCode,
          timeLimitMs: 3000,
          whyThisProblem: p.whyThisProblem,
        },
        create: {
          slug: p.slug,
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          topicId: topic.id,
          tags: p.tags,
          patternTags: p.patternTags,
          xpReward: reward.xp,
          coinReward: reward.coins,
          isBossBattle: p.difficulty === 'BOSS',
          order: i,
          functionName: p.functionName,
          paramNames: p.paramNames,
          starterCode: p.starterCode,
          solutionCode: p.solutionCode,
          timeLimitMs: 3000,
          whyThisProblem: p.whyThisProblem,
        },
      });

      await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
      for (let j = 0; j < p.testCases.length; j++) {
        const tc = p.testCases[j];
        await prisma.testCase.create({
          data: {
            problemId: problem.id,
            input: tc.input as any,
            expected: tc.expected as any,
            isSample: tc.isSample,
            order: j,
          },
        });
      }
    }
  }

  for (const q of quests) {
    await prisma.quest.upsert({ where: { key: q.key }, update: q, create: q });
  }

  for (const a of achievements) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: a, create: a });
  }

  const demoEmail = 'demo@dsaquest.app';
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    await prisma.user.create({
      data: {
        email: demoEmail,
        username: 'demo_adventurer',
        passwordHash: await bcrypt.hash('quested123', 10),
        avatarClass: 'Cipher',
        xp: 120,
        coins: 40,
        currentStreak: 2,
        longestStreak: 2,
        lastActiveAt: new Date(),
      },
    });
    console.log('Created demo account -> demo@dsaquest.app / quested123');
  }

  console.log(`Seeded ${topics.length} topics, ${quests.length} quests, ${achievements.length} achievements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
