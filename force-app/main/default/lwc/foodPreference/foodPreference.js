import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getFoodPreferences from '@salesforce/apex/FoodPreferenceController.getFoodPreferences';
import saveFoodPreference from '@salesforce/apex/FoodPreferenceController.saveFoodPreference';

export default class FoodPreference extends LightningElement {
    @track selectedGuest;
    @track selectedSession;
    @track foodPreference;
    @track notes;
    foodPreferences;
    wiredFoodPreferencesResult;

    @wire(getFoodPreferences)
    wiredFoodPreferences(result) {
        this.wiredFoodPreferencesResult = result;
        if (result.data) {
            this.foodPreferences = result.data;
        } else if (result.error) {
            console.error(result.error);
            this.foodPreferences = undefined;
        }
    }

    get hasData() {
        return this.foodPreferences && this.foodPreferences.length > 0;
    }

    handleGuestChange(event) {
        this.selectedGuest = event.detail.recordId;
    }

    handleSessionChange(event) {
        this.selectedSession = event.detail.recordId;
    }

    handleFoodPreferenceChange(event) {
        this.foodPreference = event.detail.value;
    }

    handleNotesChange(event) {
        this.notes = event.detail.value;
    }

    handleSubmit() {
        saveFoodPreference({
            guestId: this.selectedGuest,
            sessionId: this.selectedSession,
            foodPreference: this.foodPreference,
            notes: this.notes
        })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Food preference saved',
                        variant: 'success'
                    })
                );
                this.clearForm();
                // Refresh the wire service data using the wired result
                return refreshApex(this.wiredFoodPreferencesResult);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error saving record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    clearForm() {
        this.selectedGuest = '';
        this.selectedSession = '';
        this.foodPreference = '';
        this.notes = '';
        this.template.querySelectorAll('lightning-record-picker').forEach(picker => {
            picker.value = null;
        });
    }
}
