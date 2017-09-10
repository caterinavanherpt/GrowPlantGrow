// pseudo code

// components: 
// app
// nav
// add new plant form, 
// plant info card, 
// plant display card, 
// loginpage,


// user flow: 
// - user logs in by typing in username and password and pressing submit
// - user is brought to main page with instructions and new plant card 
// - user enters new plant information on the card by typing in information, selecting from drop down menu, and uploading a picture and submits the card by clicking on the 'add to my garden' button when complete 
// - card with picture as a background and plant name shows up in instruction section 
// - when the user clicks on a card the plant form section populates with all of the plant info that the user has entered
// - if the user wants to enter another plant, they would have to click on the add new button to get back to the form


import React from 'react';
import ReactDOM from 'react-dom';
import firebase from './firebase.js';

//firebase storage references
const dbRef = firebase.database().ref('/plants');
const dbStorageRef = firebase.storage().ref('/plants');

const Nav = () => {
	return (
		<nav className='nav'>
			<h1>Plant Stuff</h1>
			<h2>All Plants</h2>
			<button>Logout</button>
		</nav>
	)
}

const Display = () => {
	return (
		<section className='displayPlants'>
			<h3>Start keeping track of your plants! Add info into the new plant card to get started!</h3>
			<ul>
				<li></li>
			</ul>
		</section>
	)
}

const PlantInfoCard = (props) => {
	return (
		<section className="plantInfoCard">
			<ul>
				{props.plantsArray.map((plant) => {
					return (
						<li key={plant.id}>
							<h3>Plant Name: {plant.name}</h3>
							<p>Light Requirements: {plant.light}</p>
							<p>Watering Requirements: {plant.water}</p>
							<p>Soil Requirements: {plant.soil}</p>
							<p>Plant Type: {plant.type}</p>
						</li>
					);
				})}
			</ul>
		</section>
	)
}

const Form = (props) => {
	return (
		<section className='plantForm'>
			<form onSubmit={props.handleSubmit} action="">
				<input type="text" name='plantName' placeholder='Enter Plant Name' value={props.plantName} onChange={props.handleChange} />
				<input type="text" name='plantLight' placeholder='Enter Light Requirements' value={props.plantLight} onChange={props.handleChange} />
				<input type="text" name='plantWater' placeholder='Enter Water Requirements' value={props.plantWater} onChange={props.handleChange} />
				<input type="text" name='plantSoil' placeholder='Enter Soil Requirements' value={props.plantSoil} onChange={props.handleChange} />
				<label htmlFor="plantType">Select the type of plant:</label>
				<select name="plantType" id="" onChange={props.handleChange} value={props.value}>
					<option value="flower">Flower</option>
					<option value="herb">Herb</option>
					<option value="vegfru">Veggie or Fruit</option>
				</select>
				<label htmlFor="plantPic"> Select a picture of your plant:</label>
				<input type="file" name="plantPic" accept="image/*"/>
				<button>Add to garden!</button>
			</form>
		</section>
		
	)
}

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			plantName: '',
			plantLight: '',
			plantWater: '',
			plantSoil: '',
			plantType: '',
			// plantPic: '',
			plantsArray: [],
		}
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleSubmit(event) {
		event.preventDefault();
		const newPlant = {
			name: this.state.plantName,
			light: this.state.plantLight,
			water: this.state.plantWater,
			soil: this.state.plantSoil,
			type: this.state.plantType,
		};
		dbRef.push(newPlant);
	}
	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value,
		})
	}
	componentDidMount() {
		dbRef.on('value', (snapshot) => {
			const newPlantsArray = [];
			const firebasePlants = snapshot.val();
			for (let key in firebasePlants) {
				const firebasePlant = firebasePlants[key];
				firebasePlant.id = key;
				newPlantsArray.push(firebasePlant);
			}
			this.setState({
				plantsArray: newPlantsArray,
			});
		});
	}
	render() {
		return (
			<div className='app'>
				<Nav />
				<Display />
				<Form 
					handleChange={this.handleChange}
					handleSubmit={this.handleSubmit}
					// plantName={this.state.plantName}
					// plantLight={this.state.plantLight}
					// plantWater={this.state.plantWater}
					// plantSoil={this.state.plantSoil}

				/>
				<PlantInfoCard 
					name={this.state.name}
					light={this.state.light}
					water={this.state.water}
					soil={this.state.soil}
					type={this.state.type}
					plantsArray={this.state.plantsArray}
				/>
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));