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
const dbStorageRef = firebase.storage().ref('/plantPictures');

const Nav = () => {
	return (
		<nav className='nav'>
			<h1>Grow<br/><span>Plant</span><br/>Grow</h1>
			<button>Logout</button>
		</nav>
	)
}

const Display = (props) => {
	return (
		<section className='displayPlants'>
			{props.gardenEmpty ?
				<h3>Keep track of your plants! <br/> Add plant info and images into the new plant form to get started...</h3>
			:
				<ul className="displayPlants__item" onClick={props.handleInfoCardDisplay}>
					{props.plantsArray.map((plant) => {
						return (
							<li key={plant.id}>
								<img src={plant.firebasePicPath} alt=""/>
								<h4>{plant.name}</h4>
							</li>
						);
					})}
				</ul>
			}
		</section>
	)
}

const PlantInfoSection = (props) => {
	let plantInfoCardSection =  (
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
							<img src={plant.firebasePicPath} alt="Picture of a plant"/>
							<button onClick={() => props.removeItem(plant.id)}>Remove this plant from your garden!</button>
						</li>
					);
				})}
			</ul>
		</section>
	)
	let plantFormSection = (
		<section className='plantForm'>
			<form onSubmit={props.handleSubmit} action="" method="post">
				<h2>New Plant Form</h2>
				<p>Fill out the form below to add a new plant to your garden.</p>
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
				<input id="fileItem" type="file" name="plantPic" accept="image/*" value={props.plantPic} onChange={props.handleUpload} />
				{props.loading ? 
					<div>You're image is loading</div>
				: 
					<button>Add to garden!</button>
				}
			</form>
		</section>
	)
	return (
		<div className="plantInfoSection"> 
			{props.plantInfoRequest ? plantInfoCardSection : plantFormSection}
		</div>
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
			plantPic: '',
			plantUrl: '',
			plantsArray: [],
			loading: false, 
			gardenEmpty: true,
			plantInfoRequest: false, 
		}
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleUpload = this.handleUpload.bind(this);
		this.removeItem = this.removeItem.bind(this);
		this.handleInfoCardDisplay = this.handleInfoCardDisplay.bind(this);
	}
	handleUpload(event) {
		this.setState({
			plantPic: event.target.value,
			loading: true,
		}, () => {
			const picPath = this.state.plantPic;
			const picRef = dbStorageRef.child(picPath);
			const picFile = document.getElementById('fileItem').files[0];
			picRef.put(picFile).then (() => {
				picRef.getDownloadURL().then ((url) =>{
					this.setState({
						plantUrl: url,
						loading: false,
					})
				});
			});
		});
	}
	handleSubmit(event) {
		event.preventDefault();
		const newPlant = {
			name: this.state.plantName,
			light: this.state.plantLight,
			water: this.state.plantWater,
			soil: this.state.plantSoil,
			type: this.state.plantType,
			userPicPath: this.state.plantPic,
			firebasePicPath: this.state.plantUrl,
		};
		dbRef.push(newPlant);
		this.setState ({
			plantName: '',
			plantLight: '',
			plantWater: '',
			plantSoil: '',
			plantType: '',
			plantPic: '',
		})
	}
	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value,
		})
	}
	removeItem(key) {
		const plantRef = firebase.database().ref(`/plants/${key}`)
		plantRef.remove();
	}
	handleInfoCardDisplay() {
		// const plantRef = firebase.database().ref(`/plants/${key}`)
		this.setState({
			plantInfoRequest: true
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
			if (newPlantsArray.length > 0) {
				this.setState({
					gardenEmpty: false,
				})
			} else {
				this.setState({
					gardenEmpty: true,
				})
			}
		});
	}
	render() {
		return (
			<div className='app'>
				<Nav 
					// user={user}
				/>
				<Display 
					handleInfoCardDisplay={this.handleInfoCardDisplay}

					plantsArray={this.state.plantsArray}
					gardenEmpty={this.state.gardenEmpty}
				/>
				<PlantInfoSection
					removeItem={this.removeItem}
					handleChange={this.handleChange}
					handleSubmit={this.handleSubmit}
					handleUpload={this.handleUpload}
					handleInfoCardDisplay={this.handleInfoCardDisplay}

					plantsArray={this.state.plantsArray}
					plantName={this.state.plantName}
					plantLight={this.state.plantLight}
					plantWater={this.state.plantWater}
					plantSoil={this.state.plantSoil}
					plantType={this.state.plantType}
					plantPic={this.state.plantPic}
					loading={this.state.loading}
					plantInfoRequest={this.state.plantInfoRequest}
				/>
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));