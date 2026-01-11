const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('./models/Question');

const questions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctOption: 2,
    difficulty: "easy"
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctOption: 1,
    difficulty: "easy"
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctOption: 3,
    difficulty: "easy"
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctOption: 2,
    difficulty: "medium"
  },
  {
    question: "In which year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctOption: 2,
    difficulty: "medium"
  },
  {
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctOption: 2,
    difficulty: "easy"
  },
  {
    question: "Which programming language is known as the 'language of the web'?",
    options: ["Python", "JavaScript", "Java", "C++"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "What is the speed of light in vacuum (approximately)?",
    options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
    correctOption: 0,
    difficulty: "hard"
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctOption: 2,
    difficulty: "medium"
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    correctOption: 1,
    difficulty: "easy"
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    correctOption: 2,
    difficulty: "easy"
  },
  {
    question: "In which continent is the Sahara Desert located?",
    options: ["Asia", "Africa", "Australia", "South America"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "What is the main ingredient in guacamole?",
    options: ["Tomato", "Avocado", "Cucumber", "Pepper"],
    correctOption: 1,
    difficulty: "easy"
  },
  {
    question: "Who invented the telephone?",
    options: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    correctOption: 2,
    difficulty: "medium"
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correctOption: 2,
    difficulty: "easy"
  },
  {
    question: "What is the longest river in the world?",
    options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "Which gas makes up the majority of Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    correctOption: 2,
    difficulty: "medium"
  },
  {
    question: "What is the value of π (pi) to two decimal places?",
    options: ["3.12", "3.14", "3.16", "3.18"],
    correctOption: 1,
    difficulty: "easy"
  },
  {
    question: "Who was the first person to walk on the moon?",
    options: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "Yuri Gagarin"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "What is the largest organ in the human body?",
    options: ["Liver", "Lung", "Skin", "Intestine"],
    correctOption: 2,
    difficulty: "medium"
  },
  {
    question: "Which country is known as the Land of the Rising Sun?",
    options: ["China", "South Korea", "Japan", "Thailand"],
    correctOption: 2,
    difficulty: "easy"
  },
  {
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Utility"],
    correctOption: 0,
    difficulty: "medium"
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correctOption: 1,
    difficulty: "easy"
  },
  {
    question: "What is the boiling point of water in Celsius?",
    options: ["90°C", "95°C", "100°C", "105°C"],
    correctOption: 2,
    difficulty: "easy"
  },
  {
    question: "Who wrote '1984'?",
    options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "H.G. Wells"],
    correctOption: 0,
    difficulty: "medium"
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "Which sport is played at Wimbledon?",
    options: ["Football", "Tennis", "Golf", "Cricket"],
    correctOption: 1,
    difficulty: "easy"
  },
  {
    question: "What is the chemical formula for water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctOption: 0,
    difficulty: "easy"
  },
  {
    question: "How many chambers does a human heart have?",
    options: ["2", "3", "4", "5"],
    correctOption: 2,
    difficulty: "medium"
  },
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
    correctOption: 2,
    difficulty: "easy"
  },
  {
    question: "Who discovered penicillin?",
    options: ["Marie Curie", "Alexander Fleming", "Louis Pasteur", "Joseph Lister"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "What is the largest desert in the world?",
    options: ["Gobi", "Sahara", "Antarctic", "Arabian"],
    correctOption: 2,
    difficulty: "hard"
  },
  {
    question: "How many bones are in an adult human body?",
    options: ["196", "206", "216", "226"],
    correctOption: 1,
    difficulty: "medium"
  },
  {
    question: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Leopard", "Horse"],
    correctOption: 1,
    difficulty: "easy"
  },
  {
    question: "Which planet is closest to the Sun?",
    options: ["Venus", "Earth", "Mercury", "Mars"],
    correctOption: 2,
    difficulty: "easy",
    category: "general"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tokenrush');
    
    await Question.deleteMany({});
    await Question.insertMany(questions);
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

seed();

