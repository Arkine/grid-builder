import {parse, stringify} from 'flatted'; // Allows us to create circular references

export default class StorageAPI {
	constructor(key = 'grid_storage') {
		this.key = key;
	}

	static getToken(token) {
		return parse(localStorage.getItem(token));
	}

	static setToken(token, data) {
		localStorage.setItem(token, stringify(data));
	}

	static removeToken(token) {
		localStorage.removeItem(token);
	}

	static resetData() {
		localStorage.removeItem(`${this.key}`);
	}

	loadData() {
		const data = localStorage.getItem(`${this.key}`);

		return data ? parse(data) : null;
	}

	saveData(data) {
		localStorage.setItem(`${this.key}`, stringify(data));
	}
}