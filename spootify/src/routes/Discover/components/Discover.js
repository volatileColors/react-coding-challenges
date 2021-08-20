import React, { Component } from 'react';
import DiscoverBlock from './DiscoverBlock/components/DiscoverBlock';
import '../styles/_discover.scss';
import axios from 'axios';
import api from 'config';

export default class Discover extends Component {
  constructor() {
    super();

    this.state = {
      newReleases: [],
      playlists: [],
      categories: [],
      access_token: ''
    };
  }

  componentDidMount() {
    this.authorizeAPI().then((token) => {
      this.setState({ access_token: token})

      this.performAllCalls();
    });
  }

  async authorizeAPI() {
    const authUrl = api.api['authUrl'];
    const clientId = api.api['clientId'];
    const clientSecret = api.api['clientSecret'];

    const res = await axios({
      url: authUrl,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
      },
      data: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    });
    return res.data['access_token'];
  }

  async performAllCalls() {
    let [releases, playlists, categories] = await Promise.all([this.getNewReleases(), this.getPlaylists(), this.getCategories()]);

    this.setState({ newReleases: releases.albums['items'] });
    this.setState({ playlists: playlists.playlists['items']});
    this.setState({ categories: categories.categories['items']});
  }

  getNewReleases() {
    return new Promise((resolve, reject) => {
      return axios({
        url: api.api['baseUrl'] + '/browse/new-releases',
        method: 'get',
        headers: {
          'Authorization': `Bearer ${this.state.access_token}`
        },
      }).then((res) => {
        resolve(res.data);
      }).catch((error) => {
        resolve(null);
      })
    })
  }

  getPlaylists() {
    return new Promise((resolve, reject) => {
      return axios({
        url: api.api['baseUrl'] + '/browse/featured-playlists',
        method: 'get',
        headers: {
          'Authorization': `Bearer ${this.state.access_token}`
        },
      }).then((res) => {
        resolve(res.data);
      }).catch((error) => {
        resolve(null);
      })
    })
  }

  getCategories() {
    return new Promise((resolve, reject) => {
      return axios({
        url: api.api['baseUrl'] + '/browse/categories',
        method: 'get',
        headers: {
          'Authorization': `Bearer ${this.state.access_token}`
        },
      }).then((res) => {
        resolve(res.data);
      }).catch((error) => {
        resolve(null);
      })
    })
  }

  render() {
    const { newReleases, playlists, categories } = this.state;

    return (
      <div className="discover">
        <DiscoverBlock text="RELEASED THIS WEEK" id="released" data={newReleases} />
        <DiscoverBlock text="FEATURED PLAYLISTS" id="featured" data={playlists} />
        <DiscoverBlock text="BROWSE" id="browse" data={categories} imagesKey="icons" />
      </div>
    );
  }
}
