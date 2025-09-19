public with sharing class FoodPreferenceController {
    @AuraEnabled(cacheable=true)
    public static List<Food_Preference__c> getFoodPreferences() {
        return [SELECT Id, Food_Preference__c, Notes__c FROM Food_Preference__c];
    }

    @AuraEnabled
    public static void saveFoodPreference(Id guestId, Id sessionId, String foodPreference, String notes) {
        Food_Preference__c preference = new Food_Preference__c();
        preference.Guest__c = guestId;
        preference.Session__c = sessionId;
        preference.Food_Preference__c = foodPreference;
        preference.Notes__c = notes;
        insert preference;
    }
}
