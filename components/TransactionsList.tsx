import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const MAX_CARD_LIMIT = 1500;

interface Transaction {
  id: string;
  type: 'Payment' | 'Credit';
  amount: number;
  name: string;
  description: string;
  date: string;
  pending: boolean;
  authorizedUser?: string | null;
  iconName: string;
  card?: string;
  transactionId?: string;
  cashbackPercent?: number;
}

/** Task: Payment = card top-up (+), Credit = card expense (no +) */
function formatAmount(type: Transaction['type'], amount: number): string {
  const n = Math.abs(amount).toFixed(2);
  if (type === 'Payment') return `+$${n}`;
  return `$${n}`;
}

const faClassForIcon = (iconName: string): string => {
  const map: Record<string, string> = {
    apple: 'fa-brands fa-apple',
    creditcard: 'fa-solid fa-credit-card',
    'shopping-bag': 'fa-solid fa-bag-shopping',
    'shopping-cart': 'fa-solid fa-cart-shopping',
    box: 'fa-solid fa-box',
    'dollar-sign': 'fa-solid fa-dollar-sign',
    globe: 'fa-solid fa-globe',
  };
  return map[iconName] ?? 'fa-solid fa-receipt';
};

const getRandomDarkColor = (seed: string) => {
  const colors = [
    '#1a1a2e',
    '#16213e',
    '#0f3460',
    '#533483',
    '#2c1a4a',
    '#3d2817',
    '#1a3a2a',
    '#2d132c',
  ];
  const index = seed.charCodeAt(0) % colors.length;
  return colors[index];
};

/** Last week: Today / Yesterday / weekday; older: M/D/YY */
function formatDateMeta(dateString: string, authorizedUser?: string | null): string {
  const d = new Date(`${dateString}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tx = new Date(d);
  tx.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - tx.getTime()) / 86400000);

  let datePart: string;
  if (diffDays === 0) datePart = 'Today';
  else if (diffDays === 1) datePart = 'Yesterday';
  else if (diffDays >= 2 && diffDays <= 7) {
    datePart = tx.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    datePart = tx.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    });
  }

  if (authorizedUser) return `${authorizedUser} — ${datePart}`;
  return datePart;
}

function randomCardBalance(): number {
  return Math.round((15 + Math.random() * 400) * 100) / 100;
}

const calculatePointsForDay = (day: number): number => {
  if (day <= 0) return 0;
  if (day === 1) return 2;
  if (day === 2) return 3;

  let prev = 3;
  let prevPrev = 2;

  for (let d = 3; d <= day; d++) {
    const current = Math.round(prevPrev + prev * 0.6);
    prevPrev = prev;
    prev = current;
  }

  return prev;
};

const calculateDailyPoints = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  const season = Math.floor(now.getMonth() / 3);
  const seasonStart = new Date(year, season * 3, 1);
  const dayOfSeason =
    Math.floor((now.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24)) +
    1;

  let points = 0;

  for (let day = 1; day <= dayOfSeason; day++) {
    if (day === 1) {
      points = 2;
    } else if (day === 2) {
      points = 3;
    } else {
      const dayBefore = day - 1;
      const dayBeforeThePrevious = day - 2;
      const prevPoints = calculatePointsForDay(dayBefore);
      const prevPrevPoints = calculatePointsForDay(dayBeforeThePrevious);
      points = Math.round(prevPrevPoints + prevPoints * 0.6);
    }
  }

  return Math.round(points);
};

const formatPoints = (points: number): string => {
  if (points >= 1000) {
    return `${Math.round(points / 1000)}K`;
  }
  return points.toString();
};

const Page = styled.div`
  min-height: 100vh;
  background: #f2f2f7;
`;

const Container = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 28rem;
  padding: 1rem;
`;

/** Left: balance + points stacked; right: No Payment Due spans both rows */
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const BalanceCard = styled.div`
  grid-column: 1;
  grid-row: 1;
  background: #fff;
  border-radius: 14px;
  padding: 1rem;
`;

const NoPaymentCard = styled.div`
  grid-column: 2;
  grid-row: 1 / span 2;
  background: #fff;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
`;

const PointsCard = styled.div`
  grid-column: 1;
  grid-row: 2;
  background: #fff;
  border-radius: 14px;
  padding: 1rem;
`;

const LabelXs = styled.p`
  font-size: 0.75rem;
  line-height: 1.2;
  color: #6b7280;
  margin: 0 0 0.35rem;
`;

const BalanceAmount = styled.p`
  font-size: 1.375rem;
  line-height: 1.2;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.35rem;
`;

const MutedXs = styled.p`
  font-size: 0.75rem;
  line-height: 1.3;
  color: #8e8e93;
  margin: 0;
`;

const PointsValue = styled.p`
  font-size: 1.125rem;
  line-height: 1.2;
  font-weight: 600;
  color: #3c3c43;
  margin: 0;
`;

const CheckCircle = styled.div`
  align-self: flex-end;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #e5e5ea;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
`;

const CheckSvg = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
  color: #000;
`;

const SectionTitle = styled.h2`
  margin: 0 0 0.75rem;
  font-size: 1.0625rem;
  line-height: 1.3;
  font-weight: 700;
  color: #000;
`;

const SkeletonStack = styled.div`
  display: flex;
  flex-direction: column;
`;

const SkeletonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e5ea;
  background: transparent;
`;

const SkIcon = styled.div`
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 10px;
  background: #e5e5ea;
`;

const SkLines = styled.div`
  flex: 1;
`;

const SkLine1 = styled.div`
  height: 0.875rem;
  width: 6rem;
  border-radius: 4px;
  background: #e5e5ea;
`;

const SkLine2 = styled.div`
  margin-top: 0.35rem;
  height: 0.7rem;
  width: 8rem;
  border-radius: 4px;
  background: #ececf0;
`;

const TxLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const ListWrap = styled.div`
  background: #fff;
  border-radius: 14px;
  overflow: hidden;

  & > a:not(:last-child) > div {
    border-bottom: 1px solid #e5e5ea;
  }
`;

const TxRow = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.15s ease;

  &:active {
    background: #f9f9fb;
  }
`;

const TxLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
`;

const IconBox = styled.div<{ $bg: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 10px;
  flex-shrink: 0;
  background-color: ${({ $bg }) => $bg};
  color: #fff;
  font-size: 1.125rem;

  .fa-brands {
    font-size: 1.25rem;
  }
`;

const TxText = styled.div`
  min-width: 0;
  flex: 1;
`;

const NameLine = styled.p`
  font-weight: 600;
  font-size: 0.9375rem;
  color: #000;
  margin: 0;
`;

const DescText = styled.p`
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0.2rem 0 0;
  line-height: 1.35;
`;

const DateText = styled.p`
  font-size: 0.75rem;
  color: #8e8e93;
  margin: 0.25rem 0 0;
`;

const TxRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  flex-shrink: 0;
  gap: 0.15rem;
`;

const AmountRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const AmountText = styled.span`
  font-weight: 600;
  font-size: 0.9375rem;
  color: #000;
`;

const CashbackText = styled.span`
  font-size: 0.75rem;
  color: #8e8e93;
`;

const ChevronIcon = styled.i`
  color: #c7c7cc;
  font-size: 0.75rem;
`;

export default function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const cardBalance = useMemo(() => randomCardBalance(), []);
  const dailyPoints = useMemo(() => calculateDailyPoints(), []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/transactions.json');
        const data: Transaction[] = await response.json();
        setTransactions(data.slice(0, 10));
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const availableBalance = (MAX_CARD_LIMIT - cardBalance).toFixed(2);
  const formattedBalance = cardBalance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Page>
      <Container>
        <DashboardGrid>
          <BalanceCard>
            <LabelXs>Card Balance</LabelXs>
            <BalanceAmount>${formattedBalance}</BalanceAmount>
            <MutedXs>
              ${Number(availableBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              Available
            </MutedXs>
          </BalanceCard>

          <NoPaymentCard>
            <div>
              <LabelXs>No Payment Due</LabelXs>
              <MutedXs>You&apos;ve paid your balance.</MutedXs>
            </div>
            <CheckCircle>
              <CheckSvg fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </CheckSvg>
            </CheckCircle>
          </NoPaymentCard>

          <PointsCard>
            <LabelXs>Daily Points</LabelXs>
            <PointsValue>{formatPoints(dailyPoints)}</PointsValue>
          </PointsCard>
        </DashboardGrid>

        <div>
          <SectionTitle>Latest Transactions</SectionTitle>

          {loading ? (
            <ListWrap>
              <SkeletonStack>
                {[...Array(3)].map((_, i) => (
                  <SkeletonRow key={i}>
                    <SkIcon />
                    <SkLines>
                      <SkLine1 />
                      <SkLine2 />
                    </SkLines>
                  </SkeletonRow>
                ))}
              </SkeletonStack>
            </ListWrap>
          ) : (
            <ListWrap>
              {transactions.map((transaction) => (
                <TxLink key={transaction.id} to={`/transaction/${transaction.id}`}>
                  <TxRow>
                    <TxLeft>
                      <IconBox $bg={getRandomDarkColor(transaction.id)}>
                        <i className={faClassForIcon(transaction.iconName)} aria-hidden />
                      </IconBox>
                      <TxText>
                        <NameLine>{transaction.name}</NameLine>
                        <DescText>
                          {transaction.pending ? (
                            <>
                              Pending - {transaction.description}
                            </>
                          ) : (
                            transaction.description
                          )}
                        </DescText>
                        <DateText>
                          {formatDateMeta(transaction.date, transaction.authorizedUser)}
                        </DateText>
                      </TxText>
                    </TxLeft>
                    <TxRight>
                      <AmountRow>
                        <AmountText>
                          {formatAmount(transaction.type, transaction.amount)}
                        </AmountText>
                        <ChevronIcon className="fa-solid fa-chevron-right" aria-hidden />
                      </AmountRow>
                      {transaction.cashbackPercent != null && (
                        <CashbackText>{transaction.cashbackPercent}%</CashbackText>
                      )}
                    </TxRight>
                  </TxRow>
                </TxLink>
              ))}
            </ListWrap>
          )}
        </div>
      </Container>
    </Page>
  );
}
