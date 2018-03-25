import { CoinNotationPipe } from './coin-notation.pipe';
import { GlobalService } from '../services/global.service';

const expectedCoin = "EGA"
class MockGlobalService extends GlobalService {
  getCoinUnit() { return expectedCoin }
}

describe('CoinNotationPipe', () => {
  it('create an instance', () => {
    const pipe = new CoinNotationPipe(new MockGlobalService);
    expect(pipe).toBeTruthy();
  });

  it('should return the coin given by global.service', () => {
    const pipe = new CoinNotationPipe(new MockGlobalService);
    expect(pipe.getCoinUnit()).toBe(expectedCoin);
  });

  it('transform divides by 100,000,000.0 when it doesn\'t know the coin', () => {
    const pipe = new CoinNotationPipe(new MockGlobalService);
    expect(pipe.transform(200000000).toString()).toBe('2.00000000');
    expect(pipe.transform(200000001).toString()).toBe('2.00000001');
  });
});
