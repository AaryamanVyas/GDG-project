export type Flashcard = {
    id: string;
    question: string;
    answer: string;
  };
  
  export type Deck = {
    id: string;
    name: string;
    cards: Flashcard[];
    createdAt: number;
  };
  
  export type TestResult = {
    id: string;
    deckId: string;
    score: number;
    total: number;
    bestStreak: number;
    correct: number;
    wrong: number;
    endedAt: number;
  };
  
  export type AppState = {
    decks: Deck[];
    coins: number;
    testHistory: TestResult[];
    openaiApiKey?: string;
  };
  
  export type Ctx = {
    state: AppState;
    addDeck: (name: string) => void;
    deleteDeck: (id: string) => void;
    addCard: (deckId: string, question: string, answer: string) => void;
    deleteCard: (deckId: string, cardId: string) => void;
    recordTest: (result: Omit<TestResult, 'id' | 'endedAt'>) => void;
    addCoins: (amount: number) => void;
    setOpenAIApiKey: (key: string | undefined) => void;
  };
  