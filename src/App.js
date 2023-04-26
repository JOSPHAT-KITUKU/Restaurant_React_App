import './App.css';
import {Amplify, API, graphqlOperation } from 'aws-amplify';
import React, {useState, useEffect} from 'react';
import { createRestaurant } from './graphql/mutations';
import { listRestaurants } from './graphql/queries';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

const initialState = {name: '', description: '', city: ''};

function App({signOut, user}) {
  const [formstate, setFormState] = useState(initialState);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(()=>{
    fetchRestaurants();
  }, [])

  function setInput(key, value){
    setFormState({...formstate, [key]: value});
  }
  async function fetchRestaurants(){
    try{
      const restaurantsData = await API.graphql(graphqlOperation(listRestaurants));
      const restaurants_d = restaurantsData.data.listRestaurants.items
      setRestaurants(restaurants_d);
    }catch(error){
      console.log("Error Fetching Restaurants Data");
    }
  }

  async function createRest(){
    try{
      if (!formstate.name || !formstate.description || !formstate.city){
        return;
      }
      const restaurant = {...formstate}
      setFormState(initialState);
      await API.graphql(graphqlOperation(createRestaurant, {input: restaurant}));
    }catch(error){
      console.log("Unable to Add Restaurant", error);
    }
  }
  return (
    <div className="App">
      <div className='user'>
      <div className='user-name'><Heading level={1}>Hello {user.username}</Heading></div>
      <div className='btn-signout'><Button  onClick={signOut}>Sign out</Button></div>
      </div>
      
      <div className='form'>
          <h1>Create Restaurant</h1>
          <input type='text' onChange={e => setInput('name', e.target.value)} value={formstate.name} placeholder='Restaurant Name'></input>
          <input type='text' onChange={e => setInput('description', e.target.value)} value={formstate.description} placeholder='Description'></input>
          <input type='text' onChange={e => setInput('city', e.target.value)} value={formstate.city} placeholder='City'></input>
          <button className='btn' onClick={createRest}>Add Restaurant</button>
      </div>
      <div className='data-wrapper'>
      <div className='t-rest-name'>Name</div>
            <div className='t-rest-desc'>Description</div>
            <div className='t-rest-city'>City</div>
      </div>
      {
           restaurants.map((rest, index) =>(
          <div key={rest.id? rest.id: index}>
            <div className='data-wrapper'>
            <div className='rest-name'>{rest.name}</div>
            <div className='rest-desc'>{rest.description}</div>
            <div className='rest-city'>{rest.city}</div>
            </div>
          </div>
        ))

      }


    </div>
  );
}

export default withAuthenticator(App);
