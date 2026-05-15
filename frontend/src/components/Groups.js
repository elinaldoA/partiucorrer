
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUsers, FaUserPlus, FaPlus, FaUserFriends, FaLock, FaUnlockAlt, FaChartLine, FaCrown, FaTimes, FaComments, FaStar } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import GroupChat from './GroupChat';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
const Groups = () => {
  const { t } = useLanguage();
  const { subscription, getMaxValue, loading: subLoading } = useSubscription();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChatGroup, setSelectedChatGroup] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_private: false
  });
  const maxGroups = getMaxValue('max_groups');
  const isUnlimited = maxGroups === -1;
  const isFree = !subscription || subscription.name === 'Grátis';
  const canCreateMore = isUnlimited || groups.length < maxGroups;
  const fetchGroups = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);
  const fetchGroupMembers = useCallback(async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data);
    } catch (error) {
      toast.error(t('common.error'));
    }
  }, [t]);
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!canCreateMore) {
      toast.error(`Você atingiu o limite de ${maxGroups} grupos no plano Grátis. Faça upgrade para criar mais grupos.`);
      return;
    }
    if (!formData.name) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/groups', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let message = t('groups.createSuccess');
      if (response.data.inviteCode) {
        message += ` ${t('groups.inviteCode')}: ${response.data.inviteCode}`;
      }
      toast.success(message);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', is_private: false });
      fetchGroups();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };
  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!inviteCode) {
      toast.error('Código de convite é obrigatório');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/groups/${inviteCode}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('groups.joinSuccess'));
      setShowJoinModal(false);
      setInviteCode('');
      fetchGroups();
    } catch (error) {
      if (error.response?.data?.error === 'Invalid invite code') {
        toast.error(t('groups.invalidCode'));
      } else if (error.response?.data?.error === 'Already a member of this group') {
        toast.error(t('groups.alreadyMember'));
      } else {
        toast.error(t('common.error'));
      }
    }
  };
  const handleViewGroup = (group) => {
    setSelectedGroup(group);
    fetchGroupMembers(group.id);
  };
  const openChat = (group) => {
    setSelectedChatGroup(group);
    setShowChat(true);
  };
  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container-custom py-8 animate-fadeInUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('groups.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('groups.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FaUserPlus /> {t('groups.joinGroup')}
          </button>
          {canCreateMore ? (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FaPlus /> {t('groups.createGroup')}
            </button>
          ) : (
            <div className="relative group">
              <button 
                className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed"
                disabled
              >
                <FaPlus /> {t('groups.createGroup')}
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Você atingiu o limite de {maxGroups} grupos.
                <Link to="/plans" className="text-purple-400 block mt-1">Fazer Upgrade →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
      {}
      {isFree && !isUnlimited && (
        <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl text-center border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-center gap-2">
            <FaStar className="text-yellow-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Você já criou {groups.length} de {maxGroups} grupos. Faça upgrade para grupos ilimitados!
            </span>
            <Link to="/plans" className="text-purple-600 font-semibold text-sm hover:underline">Saiba mais</Link>
          </div>
        </div>
      )}
      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4 animate-float">👥</div>
          <p className="text-gray-500">{t('groups.noGroups')}</p>
          <p className="text-gray-400 text-sm mt-2">{t('groups.createOneGroup')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groups.map((group, idx) => (
            <div 
              key={group.id} 
              className="card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <FaUserFriends className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {group.is_private ? (
                        <span className="badge badge-warning flex items-center gap-1">
                          <FaLock className="text-xs" /> Privado
                        </span>
                      ) : (
                        <span className="badge badge-success flex items-center gap-1">
                          <FaUnlockAlt className="text-xs" /> Público
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {group.members_count} {t('groups.members')}
                      </span>
                    </div>
                  </div>
                </div>
                {group.invite_code && (
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full text-xs font-semibold text-purple-700">
                    Código: {group.invite_code}
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {group.description || 'Sem descrição'}
              </p>
              <div className="border-t border-gray-100 pt-4 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <FaChartLine className="text-green-500" /> {t('groups.weeklyDistance')}
                  </span>
                  <span className="font-semibold text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {group.week_distance?.toFixed(1) || 0} km
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewGroup(group);
                  }}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                >
                  <FaUsers /> Ver Membros
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openChat(group);
                  }}
                  className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2"
                >
                  <FaComments /> Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedGroup.name}</h2>
                <p className="text-gray-600 mt-1">{selectedGroup.description || 'Sem descrição'}</p>
              </div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaUsers className="text-blue-500" /> {t('groups.membersList')} ({members.length})
              </h3>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                          {member.name}
                          {member.role === 'admin' && (
                            <span className="badge badge-warning flex items-center gap-1">
                              <FaCrown className="text-xs" /> Admin
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">Membro desde {new Date(member.joined_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{member.total_distance?.toFixed(1)} km</p>
                      <p className="text-xs text-gray-500">{member.total_runs} {t('dashboard.runs')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showChat && selectedChatGroup && (
        <GroupChat
          groupId={selectedChatGroup.id}
          groupName={selectedChatGroup.name}
          onClose={() => {
            setShowChat(false);
            setSelectedChatGroup(null);
          }}
        />
      )}
      {showCreateModal && canCreateMore && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('groups.createGroup')}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="input-label">{t('groups.groupName')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Ex: Corredores Matinais"
                />
              </div>
              <div>
                <label className="input-label">{t('groups.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Descreva seu grupo..."
                />
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={(e) => setFormData({...formData, is_private: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    {formData.is_private ? <FaLock className="text-orange-500" /> : <FaUnlockAlt className="text-green-500" />}
                    {t('groups.privateGroup')}
                  </span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {t('groups.createGroup')}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('groups.joinGroup')}
              </h2>
              <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="input-label">{t('groups.inviteCode')}</label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input-field text-center text-2xl font-mono tracking-wider"
                  placeholder="••••••"
                  maxLength="6"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FaUserPlus className="text-blue-500" /> {t('groups.inviteCodeInstruction')}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {t('groups.joinGroup')}
                </button>
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn-secondary flex-1">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Groups;