'use strict';

import localStorage from '../localStorage';
import resource from '../resource';

const LS_USER = 'ls.user';

export default function(onChange) {
    let users = resource.collection('/api/users');
    let activeUserId = localStorage.getItem(LS_USER, {}).activeUserId;
    let activeUser = null;
    let notify = () => onChange ? onChange() : null;
    return {
        init() {
            return users.load().then(function() {
                if (activeUserId) {
                    activeUser = users.list().find(user => user.get('usr_id') === activeUserId);
                }
                notify();
            });
        },
        getUsers() {
            return users.list();
        },
        getActiveUser() {
            return activeUser;
        },
        login(user) {
            activeUser = user;
            localStorage.setItem(LS_USER, {activeUserId: user.get('usr_id')});
            notify();
        },
        logout() {
            activeUser = null;
            localStorage.setItem(LS_USER, {});
            notify();
        }
    };
};
