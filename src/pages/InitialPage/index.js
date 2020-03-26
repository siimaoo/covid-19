import React, { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import {states} from './variables';
import './style.css';

function InitialPage() {
  const [arr, setArr] = useState([]);
  const [estado, setEstado] = useState("AC");
  const [load, setLoad] = useState(false);
  const [allCases, setAllCases] = useState(0);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let { latitude, longitude } = position.coords;

        axios.get(`https://cors-anywhere.herokuapp.com/https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=e6fe8c3c899f43b3a9b271cc2c57f848`)
          .then(async(res) => {
            let addressData = res.data.results[0].components;
            let { state_code, town } = addressData;
            setEstado(state_code);
            setLoad(true);
          })
      }, (err) => {
        setEstado('AC');
        setLoad(true);
      })
    }
  }, []);


  useEffect(() => {
    getAllCases();
  }, [estado]);

  function getAllCases() {
    axios.get("https://cors-anywhere.herokuapp.com/https://especiais.g1.globo.com/bemestar/coronavirus/mapa-coronavirus/data/brazil-cases.json")
      .then((res) => {
        let array = res.data.docs;
        let estados = []

        array.map(element => {
          return element.state === estado ? estados.push(element) : true;
        });

        let ordenedArr = estados.sort((a, b) => {
          return (a.city_name > b.city_name) ? 1 : ((b.city_name > a.city_name) ? -1 : 0);
        });

        let groupArr;

        groupArr = _.groupBy(ordenedArr, 'city_name');

        let newArr = [];

        _.map(groupArr, element => {
          var quantity = 0;
          for (let i = 0; i < element.length; i++) {
            quantity = quantity + element[i].cases;
          }

          newArr.push({ "city_name": element[0].city_name, "count": quantity });
        })

        setArr(newArr);

        sumAllCasesMg(estados);
      })
  }

  function sumAllCasesMg(arr) {
    let quantity = 0;

    arr.map(element => {
      return quantity = quantity + element.cases;
    });

    setAllCases(quantity);
  }

  return (
    <>
      <div className="container">
        <div className="card">
          <div className="card-stacked">
            <div className="card-content">

              {
                load ? <>
                <div className="row">
                  <div className="col s12">
                    <div className="input-field col s12">
                      <select
                        value={estado}
                        class="browser-default"
                        onChange={(evt) => setEstado(evt.target.value)}
                      >
                        
                        {
                          states.map(element => {
                            return <option value={element.code}>{element.name}</option>
                          })
                        }
                      </select>                      
                    </div>
                  </div>
                </div>

                  <div className="row">
                    <div className="col s12">
                      <table>
                        <thead>
                          <tr>
                            <th>Cidade</th>
                            <th>Quantidade de Casos</th>
                          </tr>
                        </thead>

                        <tbody>
                          {
                            arr.map((element, key) => {
                              return (
                                <tr key={key}>
                                  <td>{element.city_name}</td>
                                  <td>{element.count}</td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </> : <h4>Buscando informações</h4>
              }

              <div className="card-action">
                <a href="#">Fonte: G1</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InitialPage;
