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
			<img src="public/assets/logo.svg" alt=""/>
		</nav>
	)
}

const Display = (props) => {
	return (
		<section className='displayPlants'>
			{props.gardenEmpty ?
				<div className="background__image">
					<h3>Keep track of your plants! <br/> Add plant info and images into the new plant form to get started...</h3>
				</div>
			:
				<ul className="displayPlants__item" >
					{props.plantsArray.map((plant) => {
						return (
							<li onClick={() => props.handleInfoCardDisplay(plant.id)} key={plant.id}>
								<div className="img__overlay"></div>
								<img src={plant.firebasePicPath} alt=""/>
								<div className="img__border"></div>
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
	// console.log(props);
	let plantInfoCardSection =  (
		<section className="plantInfoCard">
			<ul>
				<h2>{props.currentPlant.name}</h2>
				<li>
					<h4>Light Requirements: </h4>
					<h5>{props.currentPlant.light}</h5>
				</li>
				<li>
					<h4>Watering Requirements: </h4>
					<h5>{props.currentPlant.water}</h5>
				</li>
				<li>
					<h4>Soil Requirements: </h4>
					<h5>{props.currentPlant.soil}</h5>
				</li>
				<li>
					<h4>Plant Type: </h4>
					<h5>{props.currentPlant.type}</h5>
				</li>
				<li>
					<h4>Picture: </h4>
					<img src={props.currentPlant.firebasePicPath} alt="Picture of a plant"/>
				</li>
				<li>
					<button onClick={() => props.removeItem(props.currentPlant.id)}>Remove this plant from your garden</button>
					<button className="newPlantButton" onClick={props.addNewPlant}>Add another plant to your garden</button>
				</li>
			</ul>
		</section>
	)
	let plantFormSection = (
		<section className="plantForm__Section">
			<form className="plantForm" onSubmit={props.handleSubmit} action="" method="post">
				<h2>Add a new plant here!</h2>
				<p>Fill out the form below to add a new plant to your garden.</p>
				<ul>
					<li>
						<label htmlFor="plantName">Plant Name</label>
						<input type="text" name="plantName" value={props.plantName} onChange={props.handleChange} />
						<span>Eg: String of pearls</span>
					</li>
					<li>
						<label htmlFor="plantLight">Light Requirements</label>
						<textarea className="textarea" name="plantLight" value={props.plantLight} onChange={(e) => {
								props.handleChange(e);
								props.adjustTextarea();
							}}></textarea>
						<span>Eg: bright, indirect light</span>
					</li>
					<li>
						<label htmlFor="plantWater">Water Requirements</label>
						<textarea className="textarea" name="plantWater" value={props.plantWater} onChange={(e) => {
								props.handleChange(e);
								props.adjustTextarea();
							}}></textarea>
						<span>Eg: Once a week or when leaves get soft. Don't over water!</span>
					</li>
					<li>
						<label htmlFor="plantSoil">Soil Requirements</label>
						<textarea className="textarea" name="plantSoil" value={props.plantSoil} onChange={(e) => {
								props.handleChange(e);
								props.adjustTextarea();
							}}></textarea>
						<span>Eg. Well draining soil </span>
					</li>
					<li>
						<label htmlFor="plantType">Type of plant:</label>
						<select name="plantType" id="" onChange={props.handleChange} value={props.value}>
							<option value="" selected disabled hidden>Select the type here</option>
							<option value="flower">Flower</option>
							<option value="herb">Herb</option>
							<option value="vegfru">Veggie or Fruit</option>
						</select>
					</li>
					<li>
						<label htmlFor="plantPic"> Select a picture of your plant:</label>
						<input id="fileItem" type="file" name="plantPic" accept="image/*" value={props.plantPic} onChange={props.handleUpload} />
					</li>
					<li className="submit__button">
						{props.loading ? 
							<p>You're image is loading...</p>
						: 
							<button>Add to garden!</button>
						}
					</li>
				</ul>
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
			currentPlant: {}
		}
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleUpload = this.handleUpload.bind(this);
		this.removeItem = this.removeItem.bind(this);
		this.handleInfoCardDisplay = this.handleInfoCardDisplay.bind(this);
		this.addNewPlant = this.addNewPlant.bind(this);
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
		this.setState({
			currentPlant: {},
			plantInfoRequest: false,
		})
	}
	addNewPlant(event) {
		this.setState({
			plantInfoRequest: false,
		})
	}
	handleInfoCardDisplay(id) {
		const thePlant = this.state.plantsArray.find((plant) => {
			return plant.id === id
		});
		this.setState({
			currentPlant: thePlant,
			plantInfoRequest: true,
		})
	}
	adjustTextarea() {
		const textareas = document.getElementsByClassName("textarea");
		[...textareas].forEach((textarea) => {
			textarea.style.height = (textarea.scrollHeight)+"px";
		});
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
					adjustTextarea={this.adjustTextarea}
					addNewPlant={this.addNewPlant}

					plantsArray={this.state.plantsArray}
					plantName={this.state.plantName}
					plantLight={this.state.plantLight}
					plantWater={this.state.plantWater}
					plantSoil={this.state.plantSoil}
					plantType={this.state.plantType}
					plantPic={this.state.plantPic}
					loading={this.state.loading}
					plantInfoRequest={this.state.plantInfoRequest}
					currentPlant={this.state.currentPlant}
				/>
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));