// DialogueSystem.js - Lightweight node-based dialogue flow
class DialogueSystem {
  constructor() {
    this.dialogueBox = document.getElementById('dialogue-box');
    this.dialogueSpeaker = document.getElementById('dialogue-speaker');
    this.dialogueText = document.getElementById('dialogue-text');
    this.choiceContainer = document.getElementById('dialogue-choices');
    this.nextButton = document.getElementById('dialogue-next');

    this.isActive = false;
    this.isTyping = false;
    this.typeTimer = null;
    this.fullText = '';
    this.currentChar = 0;
    this.definition = null;
    this.currentNode = null;
    this.currentChoice = null;
    this.responseQueue = [];
    this.phase = 'idle';
    this.onComplete = null;
    this.selectedChoiceIndex = 0;
    this.typingDelayMs = 36;
    this.anchorResolver = null;

    document.addEventListener('keydown', (event) => this.handleKeydown(event));
  }

  startDialogue(definition, options = {}) {
    if (!definition?.nodes || !definition?.startId) {
      return;
    }

    this.stopTyping();
    this.definition = definition;
    this.onComplete = options.onComplete || null;
    this.anchorResolver = options.anchorResolver || null;
    this.currentChoice = null;
    this.responseQueue = [];
    this.phase = 'idle';
    this.isActive = true;
    this.dialogueBox.classList.remove('hidden');
    this.dialogueBox.classList.toggle('anchored', Boolean(this.anchorResolver));
    document.exitPointerLock?.();
    this.showNode(definition.startId);
  }

  showNode(nodeId) {
    const node = this.definition?.nodes?.[nodeId];
    if (!node) {
      this.completeDialogue();
      return;
    }

    this.currentNode = node;
    this.currentChoice = null;
    this.responseQueue = [];
    this.phase = 'node';
    this.renderSpeaker(node.speaker || '');
    this.renderLine(node.text || '', () => {
      if (node.choices?.length) {
        this.showChoices(node.choices, node.maxChoices || 2);
      } else {
        this.showNextButton(node.nextId ? 'Continue' : 'Done');
      }
    });
  }

  choose(index) {
    if (!this.isActive || this.isTyping || this.phase !== 'choice') {
      return;
    }

    const choice = this.currentNode?.choices?.[index];
    if (!choice) {
      return;
    }

    this.currentChoice = choice;
    this.choiceContainer.innerHTML = '';
    this.choiceContainer.classList.add('hidden');

    const responseLines = Array.isArray(choice.responseText)
      ? choice.responseText.filter(Boolean)
      : choice.responseText
        ? [choice.responseText]
        : [];

    if (responseLines.length) {
      this.responseQueue = responseLines;
      this.phase = 'response';
      this.renderSpeaker(choice.responseSpeaker || this.currentNode.speaker || '');
      this.renderCurrentResponse();
    } else {
      this.advanceAfterChoice();
    }
  }

  renderCurrentResponse() {
    const line = this.responseQueue[0];
    if (!line) {
      this.advanceAfterChoice();
      return;
    }

    this.renderLine(line, () => {
      const hasMoreResponses = this.responseQueue.length > 1;
      this.showNextButton(hasMoreResponses ? 'Next' : 'Continue');
    });
  }

  next() {
    if (!this.isActive) {
      return;
    }

    if (this.isTyping) {
      this.finishTyping();
      return;
    }

    if (this.phase === 'response') {
      this.responseQueue.shift();
      if (this.responseQueue.length) {
        this.renderCurrentResponse();
        return;
      }
      this.advanceAfterChoice();
      return;
    }

    if (this.phase === 'node') {
      const nextId = this.currentNode?.nextId;
      if (nextId) {
        this.showNode(nextId);
      } else {
        this.completeDialogue();
      }
    }
  }

  advanceAfterChoice() {
    const choice = this.currentChoice;
    if (choice?.callback) {
      choice.callback();
    }

    const nextId = choice?.nextId || this.currentNode?.nextId;
    if (nextId) {
      this.showNode(nextId);
      return;
    }

    this.completeDialogue();
  }

  showChoices(choices, maxChoices = 2) {
    this.phase = 'choice';
    this.selectedChoiceIndex = 0;
    this.nextButton.classList.add('hidden');
    this.nextButton.disabled = true;
    this.choiceContainer.innerHTML = '';
    this.choiceContainer.classList.remove('hidden');
    this.choiceContainer.classList.remove('visible');

    choices.slice(0, maxChoices).forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dialogue-choice';
      button.textContent = `${index + 1}. ${choice.text}`;
      button.style.animationDelay = `${index * 180}ms`;
      button.addEventListener('click', () => this.choose(index));
      this.choiceContainer.appendChild(button);
    });

    this.updateChoiceSelection();
    requestAnimationFrame(() => {
      this.choiceContainer.classList.add('visible');
    });
  }

  updateChoiceSelection() {
    const buttons = this.choiceContainer.querySelectorAll('.dialogue-choice');
    buttons.forEach((button, index) => {
      button.classList.toggle('selected', index === this.selectedChoiceIndex);
    });
  }

  showNextButton(label = 'Next') {
    this.choiceContainer.innerHTML = '';
    this.choiceContainer.classList.add('hidden');
    this.choiceContainer.classList.remove('visible');
    this.nextButton.textContent = label;
    this.nextButton.disabled = false;
    this.nextButton.classList.remove('hidden');
  }

  renderSpeaker(name) {
    this.dialogueSpeaker.textContent = name;
    this.dialogueSpeaker.classList.toggle('hidden', !name);
  }

  renderLine(text, onTypedComplete) {
    this.fullText = text;
    this.currentChar = 0;
    this.isTyping = true;
    this.dialogueText.textContent = '';
    this.dialogueText.classList.add('typing');
    this.nextButton.disabled = true;
    this.nextButton.classList.add('hidden');
    this.choiceContainer.innerHTML = '';
    this.choiceContainer.classList.add('hidden');
    this.stopTyping();

    this.typeTimer = setInterval(() => {
      this.currentChar++;
      this.dialogueText.textContent = this.fullText.slice(0, this.currentChar);

      if (this.currentChar >= this.fullText.length) {
        this.finishTyping();
        onTypedComplete?.();
      }
    }, this.typingDelayMs);
  }

  finishTyping() {
    this.stopTyping();
    this.dialogueText.textContent = this.fullText;
    this.dialogueText.classList.remove('typing');
    this.isTyping = false;
  }

  stopTyping() {
    if (this.typeTimer) {
      clearInterval(this.typeTimer);
      this.typeTimer = null;
    }
  }

  completeDialogue() {
    this.stopTyping();
    this.isTyping = false;
    this.isActive = false;
    this.phase = 'idle';
    this.definition = null;
    this.currentNode = null;
    this.currentChoice = null;
    this.responseQueue = [];
    this.anchorResolver = null;
    this.dialogueText.classList.remove('typing');
    this.dialogueBox.classList.add('hidden');
    this.dialogueBox.classList.remove('anchored');
    this.dialogueBox.style.left = '';
    this.dialogueBox.style.top = '';
    this.choiceContainer.innerHTML = '';
    this.choiceContainer.classList.add('hidden');
    this.nextButton.classList.add('hidden');
    this.nextButton.disabled = false;

    const callback = this.onComplete;
    this.onComplete = null;
    callback?.();
  }

  handleKeydown(event) {
    if (!this.isActive) {
      return;
    }

    const key = event.key;
    if (this.isTyping && (key === ' ' || key === 'Enter')) {
      event.preventDefault();
      this.finishTyping();
      if (this.phase === 'response') {
        const hasMoreResponses = this.responseQueue.length > 1;
        this.showNextButton(hasMoreResponses ? 'Next' : 'Continue');
      } else if (this.currentNode?.choices?.length) {
        this.showChoices(this.currentNode.choices, this.currentNode.maxChoices || 2);
      } else {
        this.showNextButton(this.currentNode?.nextId ? 'Continue' : 'Done');
      }
      return;
    }

    if (this.phase === 'choice') {
      const buttons = this.choiceContainer.querySelectorAll('.dialogue-choice');
      if (key === 'ArrowUp' || key === 'w') {
        event.preventDefault();
        this.selectedChoiceIndex = (this.selectedChoiceIndex + buttons.length - 1) % buttons.length;
        this.updateChoiceSelection();
        return;
      }
      if (key === 'ArrowDown' || key === 's') {
        event.preventDefault();
        this.selectedChoiceIndex = (this.selectedChoiceIndex + 1) % buttons.length;
        this.updateChoiceSelection();
        return;
      }
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.choose(this.selectedChoiceIndex);
        return;
      }

      const numericIndex = Number.parseInt(key, 10) - 1;
      if (!Number.isNaN(numericIndex)) {
        event.preventDefault();
        this.choose(numericIndex);
      }
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.next();
    }
  }

  isPlaying() {
    return this.isActive;
  }

  updateAnchorPosition() {
    if (!this.isActive || !this.anchorResolver) {
      return;
    }

    const position = this.anchorResolver();
    if (!position) {
      return;
    }

    this.dialogueBox.style.left = `${position.x}px`;
    this.dialogueBox.style.top = `${position.y}px`;
  }
}
