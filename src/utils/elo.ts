export interface EloResult {
  newWinnerRating: number;
  newLoserRating: number;
  winnerDelta: number;
  loserDelta: number;
}

export function getKFactor(matchesCount: number): number {
  return matchesCount < 10 ? 40 : 20;
}

export function calculateElo(
  winnerRating: number,
  winnerMatchesCount: number,
  loserRating: number,
  loserMatchesCount: number
): EloResult {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;

  const kWinner = getKFactor(winnerMatchesCount);
  const kLoser = getKFactor(loserMatchesCount);

  const winnerDelta = Math.round(kWinner * (1 - expectedWinner));
  const loserDelta = Math.round(kLoser * (0 - expectedLoser));

  return {
    newWinnerRating: winnerRating + winnerDelta,
    newLoserRating: Math.max(100, loserRating + loserDelta),
    winnerDelta,
    loserDelta,
  };
}
