"use strict";

import {POST_BASE_API} from "../constants/api.constants.mjs";
import {DATABASE_URL} from "../constants/firebase.constants.mjs";
import {loggerFactory} from "../../utils/logger.mjs";

const log = loggerFactory('[Post API]')

const URL = DATABASE_URL + POST_BASE_API;
const GET_POSTS_URL = `${URL}.json`;

const parseResponse = async (fetchPromise) => {
  const res = await fetchPromise;
  return await res.json();
}

const getPost = async (postId) => await parseResponse(fetch(`${URL}/${postId}.json`))
const getPosts = async () => {
  try {
    return await parseResponse(fetch(GET_POSTS_URL));
  } catch (error) {
    log('Something went wrong while getting the posts', error)
    return []
  }
}

export const postsApi = {getPost, getPosts}
export const ENDPOINTS = {GET_POSTS_URL}