import { useState, useEffect, FormEvent } from 'react'
import styles from './home.module.css'
import { BsSearch } from 'react-icons/bs'
import { Link, useNavigate } from 'react-router-dom'

export interface CoinProps{
  id: string;
  name: string;
  symbol: string;
  priceUsd: string;
  vwap24hr: string;
  changePercent24Hr: string;
  rank: string;
  supply: string;
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  explorer: string;
  formatedPrice?: string,
  formatedMarket?: string,
  formatedVolume?: string
}

interface DataProps{
  data: CoinProps[];
}

export function Home() {
  const [input, setInput] = useState("");
  const [coins, setCoins] = useState<CoinProps[]>([]);
  const [offset, setOffset] = useState(0);

  const navigate = useNavigate()

  useEffect(() => {
    getData();
  }, [offset])

  async function getData() {
    fetch(`https://api.coincap.io/v2/assets?limit=10&offset=${offset}`)
    .then(res => res.json())
    .then((data: DataProps) => {
        const coinsData = data.data;

        const price = Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          notation: "compact" // salva de forma compacta os valores
        })

        // salva de forma compacta os valores
        const priceCompact = Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          notation: "compact" 
        })

        // percorre todos os coins
        const formatedResult = coinsData.map((coin) => {
          // mantem tudo o que o objeto coin tem e adiciona um novo atributo
          const formated = {
            ...coin,
            formatedPrice: price.format(Number(coin.priceUsd)),
            formatedMarket: priceCompact.format(Number(coin.marketCapUsd)),
            formatedVolume: priceCompact.format(Number(coin.volumeUsd24Hr)),
          }
          return formated
        })

        const listCoins = [...coins, ...formatedResult]

        setCoins(listCoins);
        
    })
    .catch(err => console.log(err))
  }

  function handleSubmit(e: FormEvent){
    e.preventDefault();

    if(input === "") return;

    navigate(`/detail/${input}`)
  }

  function handleGetMore() {
    if(offset === 0){
      setOffset(10)
      return;
    } else {
      setOffset(offset + 10)
    }
  }

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder='Digite o nome da moeda...Ex: Bitcoin'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type='submit'>
          <BsSearch size={30} color="#FFF" />
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th scope='col'>Moeda</th>
            <th scope='col'>Valor mercado</th>            
            <th scope='col'>Preço</th>
            <th scope='col'>Volume</th>
            <th scope='col'>Mudança 24h</th>
          </tr>
        </thead>

        <tbody id='tbody'>

          {coins.length > 0 && coins.map((coin) => (
            <tr className={styles.tr} key={coin.id}>
              <td className={styles.tdLabel} data-label="Moeda">
                <div className={styles.name}>
                  <img 
                    className={styles.logo}
                    src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLocaleLowerCase()}@2x.png`} 
                    alt="Logo Crpto" 
                  />
                  <Link to={`/detail/${coin.id}`}>
                    <span>{coin.name}</span> | {coin.symbol}
                  </Link>
                </div>
              </td>

              <td className={styles.tdLabel} data-label="Valor mercado">
                {coin.formatedMarket}
              </td>

              <td className={styles.tdLabel} data-label="Preço">
                {coin.formatedPrice}
              </td>

              <td className={styles.tdLabel} data-label="Volume">
                {coin.formatedVolume}
              </td>

              <td className={Number(coin.changePercent24Hr) > 0 ? styles.tdProfit : styles.tdLoss} data-label="Mudança 24h">
                <span>{Number(coin.changePercent24Hr).toFixed(3)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button 
        className={styles.buttonMore}
        onClick={handleGetMore}> 
        Carregar mais
      </button>
    </main>
  )
}
