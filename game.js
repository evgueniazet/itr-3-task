const crypto = require("crypto");

class KeyGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }
}

class HMACCalculator {
  static calculateHMAC(message, key) {
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(message);
    return hmac.digest("hex");
  }
}

class MoveRules {
  constructor(moves) {
    this.moves = moves;
    this.winMatrix = this.generateWinMatrix();
  }

  generateWinMatrix() {
    const size = this.moves.length;
    const matrix = {};

    for (let i = 0; i < size; i++) {
      const half = Math.floor(size / 2);
      matrix[this.moves[i]] = {};
      for (let j = 1; j <= half; j++) {
        matrix[this.moves[i]][this.moves[(i + j) % size]] = "Win";
        matrix[this.moves[(i + j) % size]][this.moves[i]] = "Lose";
      }
    }

    return matrix;
  }

  determineWinner(userMove, computerMove) {
    return this.winMatrix[userMove][computerMove] || "Draw";
  }
}

class Game {
  constructor(moves) {
    this.moves = moves;
    this.key = KeyGenerator.generateKey();
    this.moveRules = new MoveRules(moves);
  }

  start() {
    console.log(
      `HMAC: ${HMACCalculator.calculateHMAC(
        this.generateComputerMove(),
        this.key
      )}`
    );
    this.displayMenu();
    this.getUserMove();
  }

  generateComputerMove() {
    const randomIndex = Math.floor(Math.random() * this.moves.length);
    return this.moves[randomIndex];
  }

  displayMenu() {
    console.log("Available moves:");
    this.moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log("0 - exit");
    console.log("? - help");
  }

  async getUserMove() {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const input = await new Promise((resolve) => {
      readline.question("Enter your move: ", (input) => {
        resolve(input);
      });
    });

    readline.close();

    if (input === "0") {
      console.log("Goodbye!");
      return;
    } else if (input === "?") {
      this.displayHelp();
    } else {
      const move = parseInt(input);
      if (move >= 1 && move <= this.moves.length) {
        const userMove = this.moves[move - 1];
        const computerMove = this.generateComputerMove();
        const winner = this.moveRules.determineWinner(userMove, computerMove);
        console.log(`Your move: ${userMove}`);
        console.log(`Computer move: ${computerMove}`);
        if (winner === "Win") {
          console.log("You win!");
        } else if (winner === "Lose") {
          console.log("You lose!");
        } else {
          console.log("It's a draw!");
        }
        console.log(`HMAC key: ${this.key}`);
      } else {
        console.log("Invalid input. Please enter a valid move number.");
      }
    }
  }

  displayHelp() {
    const size = this.moves.length;
    const table = Array(size + 1)
      .fill(null)
      .map(() => Array(size + 1).fill(""));
    table[0][0] = "Moves";
    for (let i = 1; i <= size; i++) {
      table[0][i] = this.moves[i - 1];
      table[i][0] = this.moves[i - 1];
      for (let j = 1; j <= size; j++) {
        table[i][j] =
          this.moveRules.winMatrix[this.moves[i - 1]][this.moves[j - 1]];
      }
    }
    console.table(table);
  }
}

const moves = process.argv.slice(2);
if (
  moves.length < 3 ||
  moves.length % 2 === 0 ||
  new Set(moves).size !== moves.length
) {
  console.log(
    "Invalid arguments. Please provide an odd number >=3 of non-repeating strings."
  );
  console.log("Example: node game.js rock paper scissors");
} else {
  const game = new Game(moves);
  game.start();
}
