
class InputBox {
  // Take in a <td> jquery as the jElement argument
  // also take row and col
  constructor(jElement, row, col) {
    this.jElement = jElement;
    this.row = row;
    this.col = col;
  }

  setText(text) {
    this.jElement.text(text)
  }

  getText(text) {
    return this.jElement.text();
  }

  turnYellow() {
    this.jElement.addClass("yellow");
  }

  turnGreen() {
    this.jElement.addClass("green");
  }

  turnGrey() {
    this.jElement.addClass("grey");
  }
}


// return an array of position of character occurrences in the string
function charInString(char, string) {
  let res = [];
  for (let i = 0; i < string.length; i++) {
    if (char == string[i]) {
      res.push(i);
    }
  }
  return res;
}

class Controller {
  static MAX_LINE = 6;
  static MAX_CELL = 5;

  constructor() {
    this.lines = this.setupLines();
    this.currentLine = 0;
    this.currentCol = 0;
    this.answer = this.pickARandomWord();
    this.gameState = 1; // 1 for running, 0 for pause
    this.setupKeyPress();
    this.setupVirtualKeyboard();
  }

  // return a string
  pickARandomWord() {
    return WORDS[Math.floor(Math.random()*WORDS.length)];
  }

  // Return Lines which is a 2D arrray
  setupLines() {
    let lines = [];
    for(let row = 1; row <= Controller.MAX_LINE; row++) {
      let line = [];
      for(let col = 1; col <= Controller.MAX_CELL; col++) {
        let lineClass = ".row" + row;
        let colClass = ".my-col" + col;
        let box = new InputBox($(lineClass + " > " + colClass), row, col);
        box.setText("");
        line.push(box);
      }
      lines.push(line);
    }
    return lines;
  }


  deleteCurrentChar() {
    if (this.currentCol > 0) {
      this.currentCol--;
    }
    this.lines[this.currentLine][this.currentCol].setText("");
  }

  setCurrentChar(word) {
    if (this.currentCol < Controller.MAX_CELL) {
      this.lines[this.currentLine][this.currentCol].setText(word);
      this.currentCol++;
    }
  }

  getWordFromCurLine() {
    let word = "";
    for (let i = 0; i < 5; i++) {
      word += this.lines[this.currentLine][i].getText();
    }
    return word;
  }

  playerWin() {
    // do something here
    for (let i = 0; i < Controller.MAX_CELL; i++) {
      this.lines[this.currentLine][i].turnGreen();
     }

    this.setStatusNoTimeout("Win! F5 please!");
  }

  playerLose() {
    this.setStatusNoTimeout("You lose! The answer is " + this.answer);
  }

  setStatusNoTimeout(status) {
    $(".status-bar").text(status);
  }

  setStatus(status) {
    $(".status-bar").text(status);
    setTimeout(() => {
      // clear status after certain time
      $(".status-bar").text("");
    }, 3e3)
  }

  userSendConfirm(word) {
    word = word.toLowerCase();
    if (word.length < Controller.MAX_CELL) {
      // send warning not a 5-char word yet
      this.setStatus("Not enought letter!");
    } else if (word.length == Controller.MAX_CELL) {
      // Verify the words
      if (!WORDS.includes(word)) {
        // Not a real word
        this.setStatus("Word not found!");
        return;
      }
      if (word == this.answer) {
        // Correct answer
        this.playerWin()
        return
      }
      // word is not answer
      // Find occurrences position in answer
      let charAnswerDict = {};
      for (let i = 0; i < word.length; i++) {
        if (charAnswerDict[word[i]] == null) {
          let arr = charInString(word[i], this.answer);
          if (arr.length > 0)
            charAnswerDict[word[i]] = arr;
        }
      }
      let charWordDict = {};
      for (const each of Object.keys(charAnswerDict)) {
        charWordDict[each] = charInString(each, word);
      }

      // Find intersections of characters
      let greenColor = [];
      let yellowColor = [];
      for (const each of Object.keys(charAnswerDict)) {
        let correctPos = charAnswerDict[each].filter(value => charWordDict[each].includes(value));
        let almostCorrectPos = charWordDict[each].filter(value => !correctPos.includes(value));
        greenColor = greenColor.concat(correctPos);
        yellowColor = yellowColor.concat(almostCorrectPos);
      }

      // Color the block
      for (let i = 0; i < Controller.MAX_CELL; i++) {
        if (greenColor.includes(i)) {
          this.lines[this.currentLine][i].turnGreen();
        } else if (yellowColor.includes(i)) {
          this.lines[this.currentLine][i].turnYellow();
        } else {
          this.lines[this.currentLine][i].turnGrey();
        }
      }

      if (this.currentLine < Controller.MAX_LINE - 1) {
        this.currentLine++;
        this.currentCol = 0;
      } else {
        this.playerLose();
      }


    } else {
      // This case should not happen
      alert("This case should not happen")
    }
  }

  // I gatekeep the input with game state,
  // I can also gate keep inside each action function, but I'm lazy

  setupKeyPress() {
    var self = this;
    $(document).keydown((event) => {
      switch(event.which) {
        case 8:
        // backspace
          if (this.gameState == 0) {
            break;
          }
          self.deleteCurrentChar();
          break;
        case 13:
        // Enter
          if (this.gameState == 0) {
            break;
          }
          event.preventDefault();
          self.userSendConfirm(self.getWordFromCurLine());
          break;
        default:
          break;
      }
    });

    $(document).keypress((event) => {
      if (this.gameState == 0) {
        return;
      }
      // check for enter and backspace
      let key = event.key.toUpperCase();
      if (key >= 'A' && key <= 'Z' && key.length == 1) {
        self.setCurrentChar(key);
      }
    });
  }


  setupVirtualKeyboard() {
    var self = this;
    // setup each character button
    $(".char").click((event) => {
      if (this.gameState == 0) {
        return;
      }
      self.setCurrentChar($(event.currentTarget).html());
    });

    // setup enter button
    $(".enter").click((event) => {
      if (this.gameState == 0) {
        return;
      }
      self.userSendConfirm(self.getWordFromCurLine());
    });

    // setup backspace button
    $(".backspace").click((event) => {
      if (this.gameState == 0) {
        return;
      }
      self.deleteCurrentChar();
    });
  }

}


function main() {
  let controller = new Controller();
  // setup game pause during instruction
  let modal = $("#instruction-modal");
  modal.on('show.bs.modal', () => {
    controller.gameState = 0;
  });
  modal.on('hidden.bs.modal', () => {
    controller.gameState = 1;
  });
}

main();
