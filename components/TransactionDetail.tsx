import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

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
  status?: string;
  card?: string;
  transactionId?: string;
  cashbackPercent?: number;
}

function formatAmountPrimary(type: Transaction['type'], amount: number): string {
  const n = Math.abs(amount).toFixed(2);
  if (type === 'Payment') return `+$${n}`;
  return `$${n}`;
}

function formatDateTime(dateString: string): string {
  const d = new Date(`${dateString}T12:47:00`);
  return d.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Page = styled.div`
  min-height: 100vh;
`;

const LoadingPage = styled(Page)`
  background: #f2f2f7;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  border: 2px solid transparent;
  border-bottom-color: #007aff;
  animation: ${spin} 0.8s linear infinite;
  margin-left: auto;
  margin-right: auto;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const NotFoundPage = styled(Page)`
  background: #f2f2f7;
`;

const Container = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 28rem;
  padding: 1.5rem 1rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #007aff;
  text-decoration: none;
  margin-bottom: 1rem;
  padding: 0.25rem 0;

  &:hover {
    opacity: 0.85;
  }
`;

const NotFoundText = styled.p`
  color: #4b5563;
  margin: 0;
`;

const DetailPage = styled(Page)`
  background: #f2f2f7;
`;

const DetailInner = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 28rem;
  padding: 0.75rem 1rem 2rem;
`;

const IconBack = styled.i`
  font-size: 1.25rem;
`;

const AmountSection = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  padding-top: 0.5rem;
`;

const BigAmount = styled.p`
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
`;

const MerchantName = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0 0 0.35rem;
`;

const DateTimeLine = styled.p`
  font-size: 0.8125rem;
  color: #8e8e93;
  margin: 0;
`;

const DetailsCard = styled.div`
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const Row = styled.div`
  padding: 1rem 1.125rem;
`;

const RowLabel = styled.p`
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8e8e93;
  margin: 0 0 0.35rem;
`;

const RowValue = styled.p`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #000;
  margin: 0;
`;

const RowSub = styled.p`
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0.35rem 0 0;
  line-height: 1.35;
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e5ea;
  margin: 0;
`;

const StatusBold = styled.p`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #000;
  margin: 0;
`;

const TotalSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.125rem;
  background: #fafafa;
`;

const TotalLabel = styled.span`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #000;
`;

const TotalValue = styled.span`
  font-size: 1.0625rem;
  font-weight: 700;
  color: #000;
`;

const Mono = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 0.875rem;
`;

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/transactions.json');
        const data: Transaction[] = await response.json();
        const found = data.find((t) => t.id === id);
        setTransaction(found || null);
      } catch (error) {
        console.error('Failed to load transaction:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [id]);

  if (loading) {
    return (
      <LoadingPage>
        <div style={{ textAlign: 'center' }}>
          <Spinner />
          <LoadingText>Loading transaction...</LoadingText>
        </div>
      </LoadingPage>
    );
  }

  if (!transaction) {
    return (
      <NotFoundPage>
        <Container>
          <BackLink to="/">
            <IconBack className="fa-solid fa-chevron-left" aria-hidden />
            <span style={{ marginLeft: 4 }}>Back</span>
          </BackLink>
          <NotFoundText>Transaction not found</NotFoundText>
        </Container>
      </NotFoundPage>
    );
  }

  const statusLine = transaction.pending ? 'Pending' : 'Approved';
  const descriptionDisplay = transaction.pending
    ? `Pending - ${transaction.description}`
    : transaction.description;
  const txnRef = transaction.transactionId ?? `TXN-${transaction.id.padStart(6, '0')}`;

  return (
    <DetailPage>
      <DetailInner>
        <BackLink to="/" aria-label="Back to transactions">
          <IconBack className="fa-solid fa-chevron-left" aria-hidden />
        </BackLink>

        <AmountSection>
          <BigAmount>{formatAmountPrimary(transaction.type, transaction.amount)}</BigAmount>
          <MerchantName>{transaction.name}</MerchantName>
          <DateTimeLine>{formatDateTime(transaction.date)}</DateTimeLine>
        </AmountSection>

        <DetailsCard>
          <Row>
            <StatusBold>
              Status: {statusLine}
            </StatusBold>
            <RowSub>{transaction.card ?? 'RBC Bank Debit Card'}</RowSub>
          </Row>

          <Divider />

          <Row>
            <RowLabel>Type</RowLabel>
            <RowValue>{transaction.type}</RowValue>
          </Row>

          <Divider />

          <Row>
            <RowLabel>Merchant / Name</RowLabel>
            <RowValue>{transaction.name}</RowValue>
          </Row>

          <Divider />

          <Row>
            <RowLabel>Description</RowLabel>
            <RowValue style={{ fontWeight: 500 }}>{descriptionDisplay}</RowValue>
          </Row>

          {transaction.authorizedUser && (
            <>
              <Divider />
              <Row>
                <RowLabel>Authorized user</RowLabel>
                <RowValue>{transaction.authorizedUser}</RowValue>
              </Row>
            </>
          )}

          <Divider />

          <Row>
            <RowLabel>Posted date</RowLabel>
            <RowValue>{transaction.date}</RowValue>
          </Row>

          <Divider />

          <Row>
            <RowLabel>Transaction ID</RowLabel>
            <Mono>{txnRef}</Mono>
          </Row>

          {transaction.cashbackPercent != null && (
            <>
              <Divider />
              <Row>
                <RowLabel>Cashback</RowLabel>
                <RowValue>{transaction.cashbackPercent}%</RowValue>
              </Row>
            </>
          )}

          <Divider />

          <TotalSection>
            <TotalLabel>Total</TotalLabel>
            <TotalValue>
              {formatAmountPrimary(transaction.type, transaction.amount)}
            </TotalValue>
          </TotalSection>
        </DetailsCard>
      </DetailInner>
    </DetailPage>
  );
}
