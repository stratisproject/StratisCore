export class SecretWordIndexGenerator {
  private readonly textPrefix = 'Word number ';
  constructor() {
  const getRandom = (...taken) => {
    const min = 0, max = 11;
    const getRandom = () => Math.floor(Math.random() * (max - min + 1) + min);
    var random = 0;
    while (taken.includes(random = getRandom())) { }
    return random;
  }

  const one = getRandom();
  const two = getRandom(one);
  const three = getRandom(one, two);

  const indexes = [one, two, three].sort((a, b) => a - b);
  this.index1 = indexes[0];
  this.index2 = indexes[1];
  this.index3 = indexes[2];

  this.text1 = `${this.textPrefix}${this.index1+1 }`;
  this.text2 = `${this.textPrefix}${this.index2+1 }`;
  this.text3 = `${this.textPrefix}${this.index3+1 }`;
}

index1: number;
index2: number;
index3: number;
text1: string;
text2: string;
text3: string;
}
